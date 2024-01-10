import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.renderIdMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderFrom();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }
    renderIdMenu(){
      const thisProduct = this;

      /* generat HMTL basen on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utilis.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.form.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.toggle(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderFrom(){
      const thisProduct = this;
      //console.log(thisProduct.initOrderFrom.name);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
      
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    processOrder(){
      const thisProduct = this;
      //console.log(thisProduct.processOrder.name);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ',formData);
      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //find img of option 
          const optImg = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          //console.log(optionId, option);
          //option is checked
          if(formData[paramId] && formData[paramId].includes(optionId)){
            //increase price
            if ( option.default != true){
              price+= option.price; 
            } 
            // add img of option
            if(optImg){
              optImg.classList.add(classNames.menuProduct.imageVisible);
            }
            
          } else { //option is not checked
            //decrease price
            if ( option.default == true){
              price-= option.price; 
            } 
            // remove img of option
            if(optImg){
              optImg.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;
      // multiply price by amount
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
      
    }
    prepareCartProductParams(){
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ',formData);
      // add empty object for params
      let activeParams = {};
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        activeParams[paramId] = {
          label: param.label,
          options: {}
        }
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //option is checked
          if(formData[paramId] && formData[paramId].includes(optionId)){
            activeParams[paramId].options[optionId] = option.label;
          }
        }
      }
      //console.log(activeParams);
      return activeParams;
    }
    prepareToCartProduct(){
      const thisProduct = this;

      const productSumamry = {};

      productSumamry.id = thisProduct.id;
      productSumamry.name = thisProduct.data.name;
      productSumamry.amount = thisProduct.amountWidget.value;
      productSumamry.priceSingle = thisProduct.priceSingle;
      productSumamry.price  = thisProduct.priceSingle * thisProduct.amountWidget.value;
      productSumamry.params = thisProduct.prepareCartProductParams();

      return productSumamry;

    }
    addToCart(){
      const thisProduct = this;

      //app.cart.add(thisProduct.prepareToCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareToCartProduct(),
        },
      }
      );
      thisProduct.element.dispatchEvent(event);
    }
  }

  export default Product;