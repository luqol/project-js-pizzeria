import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
//import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
        
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();

    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        //console.log('getData params: ', paramcs);

        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings 
                            + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                            + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events   
                            + '?' + params.eventsRepeat.join("&"),
        };

        //console.log('getData urls: ', urls);

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
          .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
          })
          .then(function([bookings, eventsCurrent, eventsRepeat]){
            //console.log('rezerwacja: ', bookings);
            //console.log('eventsCurrent: ', eventsCurrent);
            //console.log('eventsRepeat: ', eventsRepeat);
            thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
          });

    }
 
    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings){
          thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        for (let item of eventsCurrent){
          thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
                
            }
        }
        //console.log(thisBooking.booked);
        thisBooking.updateDOM();
        thisBooking.clearTables();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if( typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourblock = startHour; hourblock < startHour+duration; hourblock+=0.5){
            //console.log(hourblock);
            if( typeof thisBooking.booked[date][hourblock] == 'undefined'){
                thisBooking.booked[date][hourblock] = [];
            }
    
            thisBooking.booked[date][hourblock].push(table);
        }

    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }

        }
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
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.booking.floor);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.from);

        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.adress = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration);
        thisBooking.dom.ppl = thisBooking.dom.wrapper.querySelector(select.booking.ppl);

        thisBooking.dom.water = thisBooking.dom.wrapper.querySelector(select.booking.water);
        thisBooking.dom.bread = thisBooking.dom.wrapper.querySelector(select.booking.bread);


    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){
            
        });
        
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){
            
        });


        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.dom.datePicker.addEventListener('updated', function(){

        });

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.hourPicker.addEventListener('updated', function(){
            
        });

        thisBooking.dom.wrapper.addEventListener('updated',function(){
          thisBooking.updateDOM();
          thisBooking.clearTables();
        });

        thisBooking.dom.floor.addEventListener('click', function(event){
            event.preventDefault();

            thisBooking.choosedTable(event);
        });
        
        thisBooking.dom.form.addEventListener('submit',function(event){
            event.preventDefault();
            thisBooking.sendBooking();
          });

    }

    choosedTable(event){
        const thisBooking = this;
        thisBooking.table = null;
        thisBooking.dom.floor.classList.remove(classNames.booking.msgTable);

        if(event.target.classList.contains(classNames.tables.table) && !event.target.classList.contains(classNames.booking.tableBooked)){
            //console.log('table nr: ', event.target.getAttribute('data-table'));
            for (let table of thisBooking.dom.tables){
                if(table.getAttribute(settings.booking.tableIdAttribute) == event.target.getAttribute(settings.booking.tableIdAttribute)){
                    table.classList.toggle(classNames.tables.active);
                    if (event.target.classList.contains(classNames.tables.active)){
                        thisBooking.table = parseInt(event.target.getAttribute(settings.booking.tableIdAttribute)) ;
                    } else {
                        thisBooking.table = null ;
                    }
                } else if (table.getAttribute(settings.booking.tableIdAttribute) !== event.target.getAttribute(settings.booking.tableIdAttribute) 
                            && table.classList.contains(classNames.tables.active)){
                    table.classList.remove(classNames.tables.active);            
                }
            }


        } else if(event.target.classList.contains(classNames.tables.table) && event.target.classList.contains(classNames.booking.tableBooked)) {
            console.log('table nr: ', event.target.getAttribute(settings.booking.tableIdAttribute), ' jest zajety');
            thisBooking.dom.floor.classList.add(classNames.booking.msgTable);
        }
        //console.log('aktywny stolikl', thisBooking.table);
    }

    clearTables(){
        const thisBooking = this;
        thisBooking.table = null;
        thisBooking.dom.floor.classList.remove(classNames.booking.msgTable);
        for (let table of thisBooking.dom.tables){
            if (table.classList.contains(classNames.tables.active)){
            table.classList.remove(classNames.tables.active);            
            }
        }
    }

    sendBooking(){
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.bookings;
        
        const reservation = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: thisBooking.table,
            duration: parseInt(thisBooking.dom.duration.value),
            ppl: parseInt(thisBooking.dom.ppl.value),
            starters: [],
            phone: thisBooking.dom.phone.value,
            adress: thisBooking.dom.adress.value,
        }

        if(thisBooking.dom.water.checked){
            reservation.starters.push(thisBooking.dom.water.value)
        }
        if(thisBooking.dom.bread.checked){
            reservation.starters.push(thisBooking.dom.bread.value)
        }
        
        //console.log(reservation);

        const option = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservation),
        };

        fetch(url, option)
        .then(function(response){
            return response.json();
        }).then(function(parsedResponse){
            console.log('parsedResponse: ', parsedResponse);
            thisBooking.makeBooked(reservation.date, reservation.hour, reservation.duration, reservation.table);
            thisBooking.updateDOM();
            thisBooking.clearTables();
        })

    }
}

export default Booking;