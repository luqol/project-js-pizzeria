import {settings, select} from '../settings.js';

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

  export default AmountWidget;