import {settings, select, classNames, templates} from '../settings.js';
import cartProduct from './CartProduct.js';
import {utils} from '../utils.js'

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
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.adress = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

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

      thisCart.dom.form.addEventListener('submit',function(event){
        event.preventDefault();
        thisCart.sendOrder();
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
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      

      for (let product of thisCart.products){
        thisCart.totalNumber++;
        thisCart.subtotalPrice +=  product.price;
      }

      if (thisCart.products.length !== 0){
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFree;
      }

      thisCart.dom.deliveryFee.innerHTML = deliveryFree ;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      for( let price of thisCart.dom.totalPrice ){
        price.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

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
    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        adress: thisCart.dom.adress.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: []
      };

      for(let prod of thisCart.products){
        payload.products.push(prod.getData());
      }

      const option = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      };

      fetch(url, option)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);
        });

    }
}

export default Cart;