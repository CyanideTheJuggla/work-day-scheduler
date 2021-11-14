const Luxon = luxon.DateTime;

let day;
let month;
let year;

let storedDay;
let loadedDay;

const loadDay = () => {
    //destroy anything currently displayed
    $('.container')[0].innerHTML = '';
    //create day if it doesn't exist
    if(storedDay == undefined || storedDay == null) savePlanner();
    //set date text
    $('#currentDay').html(loadedDay.toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }));
    //build content
    for (let i = 0; i < 24; i++) {
        createRow(i)
    }
    //immediately save
    savePlanner();
}

const createRow = (hour) => {
    //get stored day if it exists, empty string if not
    const storedItem = (storedDay != null ? storedDay.events[hour] : '');
    //create row. set classes, style, and data attributes
    const hourRowElement = document.createElement('div'); 
    hourRowElement.className = 'row border border-2 border-dark border-start-0 border-end-0 rounded-pill hour';
    hourRowElement.setAttribute('style', 'overflow: hidden');
    hourRowElement.dataset.hour = hour + 1;

    //create hour label div. set classes
    const hourLabelElement = document.createElement('div');
    hourLabelElement.className = 'col-lg-1 col-2 bg-light roundLeft text-dark text-center';
    
    //create hour label. set text
    const hourRowLabelElement = document.createElement('span');
    let pm = ((hour) >= 12);
    let hourAmPm = hour;
    if (pm && (hourAmPm) != 12) hourAmPm -= 12;
    if (hourAmPm == 0) hourAmPm = 12;
    hourRowLabelElement.innerHTML = `${(hourAmPm) + (pm ? 'PM' : 'AM')}`;

    //create main schedule item div. set classes
    const mainScheduleElement = document.createElement('div');
    mainScheduleElement.className = 'col-lg-10 col-8 border border-2 border-dark border-top-0 border-bottom-0 mainSchedule';
    
    //create textarea. set classes and data. 
    const textareaElement = document.createElement('textarea');
    textareaElement.setAttribute('data-hour', hour);
    textareaElement.textContent = storedItem;
    //disable and add classes
    $(textareaElement).prop('disabled', true).addClass('border border-3 border-transparent');

    //create add icon. set classes, set inner text to Material Icon to use.
    const addIconElement = document.createElement('span');
    addIconElement.className = 'material-icons btnIcon btnAdd';
    addIconElement.innerHTML = 'add';
    //create click event
    addIconElement.onclick = editSchedule;

    //create save button div. set classes
    const saveButtonElement = document.createElement('div');
    saveButtonElement.className = 'col-lg-1 col-2 saveBtn';
    //create click event
    saveButtonElement.onclick = saveSchedule;

    //create save button icon. set class, set inner text to Material Icon to use.
    const saveIconElement = document.createElement('span');
    saveIconElement.className = 'material-icons';
    saveIconElement.innerHTML = 'save';

    //build
    saveButtonElement.appendChild(saveIconElement);
    mainScheduleElement.appendChild(textareaElement);
    mainScheduleElement.appendChild(addIconElement);
    hourLabelElement.appendChild(hourRowLabelElement);
    hourRowElement.appendChild(hourLabelElement);
    hourRowElement.appendChild(mainScheduleElement);
    hourRowElement.appendChild(saveButtonElement);
   

    //figure out if this row is past, present, or future. set class accordingly
    const currentHour = Luxon.now().hour;
    
    if(loadedDay.day == Luxon.now().day) {
        if(hour == currentHour) {
            $(hourRowElement).addClass('present');
        } else if (hour > currentHour) {
            $(hourRowElement).addClass('future');
        } else if (hour < currentHour) {
            $(hourRowElement).addClass('past');
        }
    } else if(loadedDay.day > Luxon.now().day) {
        $(hourRowElement).addClass('future');
    } else if(loadedDay.day < Luxon.now().day) {
        $(hourRowElement).addClass('past');
    }
    
    //add row to container div
    $('.container')[0].appendChild(hourRowElement);
}

const saveSchedule = (e) => {
    //locate the row
    /*
        since the button is both a span AND a div, 
        it's more reliable to work down the path tree than up
    */
    var row = e.path[e.path.length - 7];
    //select the textarea within the row's children's children
    var textarea = $(row).children().children('textarea');
    //disable, remove colored border (add transparent for sizing consistency)
    textarea.prop('disabled', true).removeClass('border-info').addClass('border-transparent');
    //save
    savePlanner();
    return 'Save: Ok!';
}

const editSchedule = (e) => {
    //locate the row
    var row = $(e.path[e.path.length - 7]);
    //select the textarea
    var textarea = $(row).children().children('textarea');
    //enable, add colored border, remove transparent border
    $(textarea).prop('disabled', false).addClass('border-info').removeClass('border-transparent');
    return 'Edit: Ok!';
}

const savePlanner = () => {
    //create planner save object
    const plannerDay = {
        day: `${loadedDay.year}${loadedDay.month}${loadedDay.day}`,
        events: []
    }
    //store hours in object's events arry
    for (let i = 0; i < 24; i++) {
        let element = $(`textarea[data-hour="${i}"]`).val();
        if(element == undefined || element == null) element = '';
        plannerDay.events.push(element)
    }
    //stringify it
    const saveDay = JSON.stringify(plannerDay);
    //save it
    localStorage.setItem(plannerDay.day, saveDay);

    return 'Save planner: Ok!';
    
    /* these were for testing */
    //const loadDay = JSON.parse(localStorage.getItem(plannerDay.day));
    //console.log(plannerDay);
    //console.log(loadDay);
}

const loadNextDay = () => {
    //set current date to next day
    loadedDay = loadedDay.plus({days: 1});
    //load the day from storage, if it exists
    storedDay = JSON.parse(localStorage.getItem(`${loadedDay.year}${loadedDay.month}${loadedDay.day}`));
    //load the day
    loadDay();
    return 'loadNextDay: Ok!';
}

const loadPreviousDay = () => {
    //set current date to previous day
    loadedDay = loadedDay.plus({days: -1});
    //load the day from storage, if it exists
    storedDay = JSON.parse(localStorage.getItem(`${loadedDay.year}${loadedDay.month}${loadedDay.day}`))
    //load the day
    loadDay();
    return 'loadPreviousDay: Ok!';
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


//event listeners
$('.container .row .mainSchedule .btnAdd').click(editSchedule);
$('.container .row .savebtn span').click(saveSchedule);
$('#nextDay').click(loadNextDay);
$('#previousDay').click(loadPreviousDay);