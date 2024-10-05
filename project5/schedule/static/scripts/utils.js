// Maps day Date.getDay() numbers to day names. Language support can be added here later.
export const getDayName = function(dayNum){
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[dayNum]
}

// Converts date object to YYYY-MM-DD string
export const getHtmlDateValueFormatString = function(dateObject){
    // make month double digit
    const M = dateObject.getMonth() + 1
    const MM = M < 10 ? '0' + M : M
    
    // make day double digit
    const D = dateObject.getDate()
    const DD = D < 10 ? '0' + D : D
    
    const YYYY = dateObject.getFullYear()
    return `${YYYY}-${MM}-${DD}`
}

// Get's date format to present to user. Locale support can be added here.
// Default is en-US locale with time zone America/Los_Angeles
export const getPrettyDateFormatString = function(dateObject){
    return dateObject.toLocaleDateString()
}

// Find the "tomorrow" of the given date. 
// Returns the whole date object not the day of the month
export const getNextDate = function(dateObject){
    return new Date(dateObject.setDate(dateObject.getDate() + 1))
}

// Return an array of date objects from start to end date objects inclusive
export const getArrayOfDates = function(startDateObject, endDateObject){
    const dateArray = []
    let currentDate = new Date(startDateObject)
    do{
        dateArray.push(getNextDate(currentDate))        
    } while (currentDate <= endDateObject)

    return dateArray
}

// stringify a given object to save localy as json formatted
export const saveLocalJson = function(key, obj){
    try{
        window.localStorage.setItem(key, JSON.stringify(obj))
    } catch (err) {
        console.error(`Warning ${key} could not be saved`)
        console.error(err)
    }
}

// parse local storage data as json
export const restoreLocalJson =  function(key){
    return JSON.parse(window.localStorage.getItem(key))
}

// Convert a string to title case "hello world" becomes "Hello World"
export const toTitleCase = function(str){
    return str.replace(/\w+\s*/g, match => {
        return match.charAt(0).toUpperCase() + match.substring(1).toLowerCase()
    })
}

// Pass this to the sort function on a nodelist to sort the list by node value.
export const compareNodeValues = function(a, b){
    if(a.value < b.value){
        return -1
    }
    if(a.value > b.value){
        return 1
    }
    return 0
}