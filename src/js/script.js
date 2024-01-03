/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, 
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

  };
  

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

      app.cart.add(thisProduct.prepareToCartProduct());
    }

  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
      /*
      if (thisWidget.input.value){
        thisWidget.setValue(thisWidget.input.value);
      }else
      {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      } */
      
      thisWidget.initAction();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);
      
      /* ToDo: Add validation */
      if( newValue !== thisWidget.input.value && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
      
    }
    initAction(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        const value = parseInt(thisWidget.input.value) - 1 ;
        thisWidget.setValue(value);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        const value = parseInt(thisWidget.input.value) + 1 ;
        thisWidget.setValue(value);
      });
      
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor (element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initAction();

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    }   
    initAction(){
      const thisCart = this;
      
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      })

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

    }
    add(menuProduct){
       const thisCart = this;

       const generatedHTML = templates.cartProduct(menuProduct);

       thisCart.generatedDom = utils.createDOMFromHTML(generatedHTML);

       thisCart.dom.productList.appendChild(thisCart.generatedDom);
      //console.log('adding Product', menuProduct);

      thisCart.products.push(new cartProduct(menuProduct, this.generatedDom));
      //console.log('thisCart.products', thisCart.products);
      this.update();
    }
    update(){
      const thisCart = this;

      const deliveryFree = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (let product of thisCart.products){
        totalNumber++;
        subtotalPrice +=  product.price;
      }

      if (thisCart.products.length !== 0){
        thisCart.totalPrice = subtotalPrice + deliveryFree;
      }

      thisCart.dom.deliveryFee.innerHTML = deliveryFree ;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      for( let price of thisCart.dom.totalPrice ){
        price.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber;

    }
    remove(rProduct){
      const thisCart = this;
      const indexOfProduct = thisCart.products.indexOf(rProduct);
      //console.log('indexOf: ', indexOfProduct);
      //console.log(rProduct);

      rProduct.dom.wrapper.remove();

      if (indexOfProduct !== -1) {
        thisCart.products.splice(indexOfProduct,1);
      }
      //console.log(thisCart.products);
      thisCart.update();
    }
}

class cartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.getElements(element);

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;

    thisCartProduct.initAmountWidget();
    thisCartProduct.initAction();

    console.log(thisCartProduct);
  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }
  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      
    });

  }
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent ('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('remove');
  }
  initAction(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
      console.log('change');
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    })

  }
}

  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data', thisApp.data);

       for( let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
       }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /*save parseResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });

        //console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);

      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();

}
