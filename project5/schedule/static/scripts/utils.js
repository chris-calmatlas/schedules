export const getDuration = function(startDateObject, endDateObject){
    const dateDiff = Math.max(0, endDateObject - startDateObject)

    const epochTimes = {
        "years": 31536000000,
        "weeks": 604800000,
        "days": 86400000,
        "hours": 3600000,
        "minutes": 60000,
        "seconds": 1000
    }

    const duration = {}
    duration["total"] = {}
    duration["part"] = {}
    duration["whole"] = {}
    Object.entries(epochTimes).forEach(([key, value]) => {
        // Get the total without any remainders
        duration["total"][key] = dateDiff / value
        duration["whole"][key] = dateDiff % value ? 0 : dateDiff / value
    })

    Object.entries(epochTimes).reduce((remainder, [key, value]) => {
        duration["part"][key] = Math.floor(remainder / value)
        return (remainder % value)
    }, dateDiff)

    return duration
}

export const checkDateBoundaries = function(startDateObject, endDateObject){
    if(startDateObject != null && startDateObject != "Invalid Date"){
        if(endDateObject != null && endDateObject != "Invalid Date"){
            return "Start and End"
        }
        return "Start Only"
    }
    if(endDateObject != null && endDateObject != "Invalid Date"){
        if(startDateObject != null && startDateObject != "Invalid Date"){
            return "Start and End"
        }
        return "End Only"
    }

    return "No Dates"
}

// Maps day Date.getDay() numbers to day names. Language support can be added here later.
export const getDayName = function(dayNum){
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[dayNum]
}

// Converts date object to YYYY-MM-DD string
export const getISODateString = function(dateObject){
    return dateObject.toISOString().split("T")[0]
}

// Converts date object to YYYY-MM-DDTHH:mm string
export const getISODateTimeString = function(dateObject){
    return dateObject.toISOString().slice(0, -8)
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