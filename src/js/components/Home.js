import {templates, select, classNames} from '../settings.js';

class Home{
    constructor(element){
        const thisHome = this;

        thisHome.render(element);
        thisHome.initAction();
    }

    render(element){
        const thisHome = this;

        const generatedHTML = templates.home();

        thisHome.dom = {};

        thisHome.dom.wrapper = element;

        thisHome.dom.wrapper.innerHTML = generatedHTML;

        thisHome.dom.orderOnline = thisHome.dom.wrapper.querySelector(select.home.orderOnline);
        thisHome.dom.bookATable = thisHome.dom.wrapper.querySelector(select.home.bookATable);


    }
    initAction(){
        const thisHome = this;

        thisHome.dom.orderOnline.addEventListener('click', function(){
            thisHome.changePage(select.pageID.order);
        });
        thisHome.dom.bookATable.addEventListener('click', function(){
            thisHome.changePage(select.pageID.booking);
        });
    } 
    changePage(pageId){
        const thisHome = this;

        thisHome.pages = document.querySelector(select.containerOf.pages).children;
        thisHome.navLinks = document.querySelectorAll(select.nav.links);

        console.log(pageId);

        for (let page of thisHome.pages){

            page.classList.toggle(classNames.pages.active, page.id == pageId);
          }

          /* add class "active" to matching links, remove from non-matching */
          for (let link of thisHome.navLinks){
            console.log(link)
            link.classList.toggle(
              classNames.nav.active,
               link.getAttribute('href') == '#' + pageId
               );
          }
          window.location.hash = '#/' + pageId;
    }

}

export default Home;