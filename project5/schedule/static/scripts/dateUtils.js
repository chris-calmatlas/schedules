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

// Return an array of date objects from start to end dates inclusive
export const getArrayOfDates = function(startDate, endDate){
    const dateArray = []
    let currentDate = new Date(startDate)
    do{
        dateArray.push(getNextDate(currentDate))        
    } while (currentDate <= endDate)

    return dateArray
}

