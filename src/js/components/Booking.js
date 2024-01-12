import {select, templates} from '../settings.js';
//import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
        
        thisBooking.render(element);

        thisBooking.initWidgets();

    }

    render(element){
        const thisBooking = this;

        const generatedHtml = templates.bookingWidget();
        
        //const generatesDom = utils.createDOMFromHTML(generatedHtml);
        
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        
        thisBooking.dom.wrapper.innerHTML = generatedHtml;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){
            
        });
        
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){
            
        });


        thisBooking.dataPicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.dom.datePicker.addEventListener('updated', function(){

        });

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.hourPicker.addEventListener('updated', function(){
            
        });

    }

}

export default Booking;