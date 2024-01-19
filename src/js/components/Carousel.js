

class Carousel{
    constructor(wrapper){
        const thisCarousel = this;

        thisCarousel.dom = {};

        thisCarousel.dom.wrapper = wrapper;

        thisCarousel.initPlugin();
    }

    initPlugin(){
        const thisCarousel = this;

        thisCarousel.fikty = new Flickity(thisCarousel.dom.wrapper, {
            // options
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            autoPlay: true
     
        });

    }

}

export default Carousel;