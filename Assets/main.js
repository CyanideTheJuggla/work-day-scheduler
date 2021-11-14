const Luxon = luxon.DateTime;

//const dateNow = new Date();
let day;
let month;
let year;

let storedDay;
let loadedDay;

const loadDay = () => {
    //console.log('storedDay', storedDay);
    $('.container')[0].innerHTML = '';
    if(storedDay == undefined || storedDay == null) savePlanner();
    $('#currentDay').html(loadedDay.toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }));
    for (let i = 0; i < 24; i++) {
        createRow(i)
    }
    savePlanner();
}

const createRow = (hour) => {
    const storedItem = (storedDay != null ? storedDay.events[hour] : '');
    //console.log(storedItem);
    const hourRowElement = document.createElement('div'); 
    hourRowElement.className = 'row border border-2 border-dark border-start-0 border-end-0 rounded-pill hour';
    hourRowElement.setAttribute('style', 'overflow: hidden');
    hourRowElement.dataset.hour = hour + 1;

    const hourLabelElement = document.createElement('div');
    hourLabelElement.className = 'col-lg-1 col-2 bg-light roundLeft text-dark text-center';

    const hourRowLabelElement = document.createElement('span');
    let pm = ((hour) >= 12);
    let hourAmPm = hour;
    if (pm && (hourAmPm) != 12) hourAmPm -= 12;
    if (hourAmPm == 0) hourAmPm = 12;
    hourRowLabelElement.innerHTML = `${(hourAmPm) + (pm ? 'PM' : 'AM')}`;

    const mainScheduleElement = document.createElement('div');
    mainScheduleElement.className = 'col-lg-10 col-8 border border-2 border-dark border-top-0 border-bottom-0 mainSchedule';
    

    const textareaElement = document.createElement('textarea');
    textareaElement.setAttribute('data-hour', hour);
    textareaElement.textContent = storedItem;
    $(textareaElement).prop('disabled', true).addClass('border border-3 border-transparent');

    const addIconElement = document.createElement('span');
    addIconElement.className = 'material-icons btnIcon btnAdd';
    addIconElement.innerHTML = 'add';
    addIconElement.onclick = editSchedule;

    const saveButtonElement = document.createElement('div');
    saveButtonElement.className = 'col-lg-1 col-2 saveBtn';
    saveButtonElement.onclick = saveSchedule;

    const saveIconElement = document.createElement('span');
    saveIconElement.className = 'material-icons';
    saveIconElement.innerHTML = 'save';

    saveButtonElement.appendChild(saveIconElement);
    mainScheduleElement.appendChild(textareaElement);
    mainScheduleElement.appendChild(addIconElement);
    hourLabelElement.appendChild(hourRowLabelElement);
    hourRowElement.appendChild(hourLabelElement);
    hourRowElement.appendChild(mainScheduleElement);
    hourRowElement.appendChild(saveButtonElement);
   
    const currentHour = Luxon.now().hour;
    
    //console.log('loadedDay:' + loadedDay.day + '\nLuxon: ' + Luxon.now().day);
    //console.log(loadedDay.day == Luxon.now().day);
    //console.log(loadedDay.day > Luxon.now().day);
    //console.log(loadedDay.day < Luxon.now().day);
    
    if(loadedDay.day == Luxon.now().day){
        
        //console.log('loadedDay.day == Luxon.now().day');
        //console.log(hour + ' ||| ' + currentHour);
        //console.log(hour == currentHour);
        //console.log(hour > currentHour);
        //console.log(hour < currentHour);
        
        if(hour == currentHour){
            $(hourRowElement).addClass('present');
        } else if (hour > currentHour){
            $(hourRowElement).addClass('future');
        } else if (hour < currentHour) {
            $(hourRowElement).addClass('past');
        }
    } else if(loadedDay.day > Luxon.now().day) {
        
        //console.log('loadedDay > Luxon');
        //console.log('hourRowElement');
        //console.log(hourRowElement);
        
        $(hourRowElement).addClass('future');
    } else if(loadedDay.day < Luxon.now().day){
        
        //console.log('hourRowElement');
        //console.log(hourRowElement);
        
        $(hourRowElement).addClass('past');
    }
    
    $('.container')[0].appendChild(hourRowElement);
}

const editSchedule = (e) => {
    var row = $(e.target).parent().parent()[0];
    var textarea = $($(row).children()[1]).children()[0];
    $(textarea).prop('disabled', false).addClass('border-info').removeClass('border-transparent');
    return 'Edit: Ok!';
}

const saveSchedule = (e) => {
    var row = e.path[e.path.length - 7];
    var textarea = $(row).children().children('textarea')[0];
    $(textarea).prop('disabled', true).removeClass('border-info').addClass('border-transparent');
    savePlanner();
    return 'Save: Ok!';
}

const savePlanner = () => {
    const plannerDay = {
        day: `${loadedDay.year}${loadedDay.month}${loadedDay.day}`,
        events: []
    }
    for (let i = 0; i < 24; i++) {
        let element = $(`textarea[data-hour="${i}"]`).val();
        if(element == undefined || element == null) element = '';
        plannerDay.events.push(element)
    }
    const saveDay = JSON.stringify(plannerDay);
    localStorage.setItem(plannerDay.day, saveDay);
    const loadDay = JSON.parse(localStorage.getItem(plannerDay.day));
    //console.log(plannerDay);
    //console.log(loadDay);
    return 'Save planner: Ok!';
}

const loadNextDay = () => {
    loadedDay = loadedDay.plus({days: 1});//new Date(year.toString(),month.toString(),(day).toString());
    storedDay = JSON.parse(localStorage.getItem(`${loadedDay.year}${loadedDay.month}${loadedDay.day}`))
    //console.log('storedDay', storedDay);
    loadDay();
}

const loadPreviousDay = () => {
    loadedDay = loadedDay.plus({days: -1});//new Date(year.toString(),month.toString(),(day).toString());
    storedDay = JSON.parse(localStorage.getItem(`${loadedDay.year}${loadedDay.month}${loadedDay.day}`))
    loadDay();
}


$(document).ready(() => {
    //when page loads, load today
    loadedDay = Luxon.now();
    day = loadedDay.day;
    month = loadedDay.month;
    year = loadedDay.year;
    //set the day to today
    storedDay = JSON.parse(localStorage.getItem(`${year}${month}${day}`));
    //load today's schedule
    loadDay(); 
    //scroll to the current hour
    window.scroll(0, $('.present').offset().top - 298);
    
});

$('.container .row .mainSchedule .btnAdd').click(editSchedule);
$('.container .row .savebtn span').click(saveSchedule);
$('#nextDay').click(loadNextDay);
$('#previousDay').click(loadPreviousDay);