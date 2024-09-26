
// Maps day Date.getDay() numbers to day names. Language support can be added here later.
function getDayName(dayNum){
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[dayNum]
}

// Converts date object to YYYY-MM-DD string
function getHtmlDateValueFormatString(dateObject){
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
function getPrettyDateFormatString(dateObject){
    return dateObject.toLocaleDateString()
}

// Return an array of date objects from start to end dates inclusive
function getArrayOfDates(startDate, endDate){
    const dateArray = []
    let currentDate = new Date(startDate)
    do{
        dateArray.push(new Date(currentDate.setDate(currentDate.getDate() + 1)))        
    } while (currentDate <= endDate)

    return dateArray
}

// Clears message class on the page and returns sibling .message
function resetMessage(siblingNode){
    document.querySelectorAll(".message").forEach(node => node.innerHTML = "")
    return siblingNode.parentNode.querySelector(".message") || console.error("Could not find message container")
}

document.addEventListener("DOMContentLoaded", () => {
    scheduleBuilder()
    memberManager()
})

function scheduleBuilder() {
    // listeners
    document.querySelector(".scheduleStart").addEventListener("change", (event) => {
        buildScheduleContainer(event.target, document.querySelector(".scheduleEnd"))
    })

    document.querySelector(".scheduleEnd").addEventListener("change", (event) => {
        buildScheduleContainer(document.querySelector(".scheduleStart"), event.target)
    })

    // functions
    function validateStartEndDates(startInput, endInput) {
        // end value exists
        if(endInput.value){
            // start value also exists
            if(startInput.value){
                // Validate and correct
                if(endInput.value < startInput.value){ 
                    endInput.value = startInput.value
                    resetMessage(startInput).innerHTML = "Start date must be before end date"
                }
                return true
            }
        }
        return false
    }

    function buildShiftContainer(dateObject){
        // Create the elements
        const shiftContainer = document.createElement('div')
        const headerNode = document.createElement("h3")
        const dayNode = document.createElement("div")
        const dateNode = document.createElement("div")
        const listContainer = document.createElement("div")
        const listNode = document.createElement("ul")
       
        // Build the structure and nesting
        shiftContainer.appendChild(headerNode)
        shiftContainer.appendChild(listContainer)
        headerNode.appendChild(dayNode)
        headerNode.appendChild(dateNode)
        listContainer.appendChild(listNode)

        // Add classes
        shiftContainer.className = `card shiftContainer ${getDayName(dateObject.getDay())} ${getHtmlDateValueFormatString(dateObject)}`
        headerNode.className = "card-header"
        dayNode.className = "scheduleDay card-subtitle"
        dateNode.className = "scheduleDate card-title"
        listContainer.className = "card-body"
        listNode.className = "list-group list-group-flush"
        
        // Add innerHTML
        dayNode.innerHTML = getDayName(dateObject.getDay())
        dateNode.innerHTML = getPrettyDateFormatString(dateObject)

        return shiftContainer
    }

    function buildScheduleContainer(startInput, endInput) {
        const readyToBuild = validateStartEndDates(startInput, endInput)
        if(readyToBuild){
            // Get the container
            const scheduleContainer = document.querySelector(".scheduleContainer")
            
            // Get dates within this schedule
            const dateArray = getArrayOfDates(startInput.valueAsDate, endInput.valueAsDate)

            // Clear the old schedule and add the new
            scheduleContainer.innerHTML = ""
            dateArray.forEach((date) => {
                scheduleContainer.append(buildShiftContainer(date))
            })
        }
    }
}

function memberManager(){
    // listeners
    document.querySelector(".memberRemoveButton").addEventListener("click", (event) => {
        event.preventDefault()
        // Get selected members and remove
        const memberList = document.querySelector(".memberList")
        const existingMembers = memberList.querySelectorAll("option")
        if(existingMembers){
            existingMembers.values().forEach(node => node.selected && node.remove())
        }
    })

    document.querySelector(".memberEditButton").addEventListener("click", (event) => {
        event.preventDefault()
        // Get selected members
        const memberList = document.querySelector(".memberList")
        const message = resetMessage(memberList)
        const existingMembers = memberList.querySelectorAll("option")
        const selectedMembers = Array.from(existingMembers).filter(node => node.selected)
        // Only allow one edit
        if(selectedMembers.length > 1){
            message.innerHTML = "Only one member can be edited at a time"
            return
        }
        if(selectedMembers.length < 1){
            message.innerHTML = "Select a member to edit"
            return
        }
        editMember(selectedMembers[0])
    })

    document.querySelector(".memberAddButton").addEventListener("click", (event) => {
        event.preventDefault()
        addMember(document.querySelector(".memberAddInput"))
    })

    function editMember(option){
        // Put member in the input and remove from the select
        const memberAddInput = document.querySelector(".memberAddInput")
        memberAddInput.value = option.innerHTML
        option.hidden = true

        // Get existing buttons
        const memberList = option.parentNode
        const standardButtons = memberList.parentNode.querySelectorAll("button")
        const addButton = document.querySelector(".memberAddButton")

        // Create save Button
        const saveButton = standardButtons[0].cloneNode()
        saveButton.className = saveButton.className.replace(saveButton.Name, "memberSaveButton")
        saveButton.name = "memberSaveButton"
        saveButton.innerHTML = "Save"
        saveButton.addEventListener("click", (event) => {
            event.preventDefault()
            // Make the change
            option.remove()
            addMember(document.querySelector(".memberAddInput"))
            // Revert edit mode
            standardButtons.forEach(button => button.disabled = false)
            saveButton.remove()
            cancelButton.remove()
            addButton.hidden = false
            memberList.disabled = false
        })
        
        // Create cancel Button 
        const cancelButton = standardButtons[0].cloneNode()
        cancelButton.name = "memberCancelButton"
        cancelButton.innerHTML = "Cancel"
        cancelButton.className = cancelButton.className.replace(cancelButton.Name, "memberCancelButton")
        cancelButton.addEventListener("click", (event) => {
            event.preventDefault()
            // Bring back the name without an edit
            option.hidden = false
            // Revert edit mode
            memberAddInput.value = ""
            standardButtons.forEach(button => button.disabled = false)
            saveButton.remove()
            cancelButton.remove()
            addButton.hidden = false
            memberList.disabled = false

        })

        // Hide unneeded buttons, add new ones, and lock the select
        standardButtons.forEach(button => button.disabled = true)
        addButton.parentNode.appendChild(saveButton)
        addButton.parentNode.appendChild(cancelButton)
        addButton.hidden = true
        memberList.disabled = true
    }

    function addMember(inputNode){
        const message = resetMessage(inputNode)
        // No blanks
        if(!inputNode.value){
            message.innerHTML = "Type a name to add it to the member list"
            return
        }

        // Cleanup the input value 
        const cleanValue = cleanInputValue(inputNode.value)
        const newMember = document.createElement("Option")
        newMember.innerHTML = cleanValue.pretty
        newMember.value = cleanValue.value
        
        // Check for duplicate name
        const memberList = document.querySelector(".memberList")
        const existingMembers = memberList.querySelectorAll("option")
        if(existingMembers){
            if(existingMembers.values().find(x => x.value === newMember.value)){
                message.innerHTML = `${cleanValue.pretty} already exists`
                return
            }
        }
        
        // Add new member to members list
        memberList.append(newMember)
        
        // Sort it and redraw
        const memberArray = Array.from(memberList).sort(compareNodeValues)
        memberList.innerHTML = ""
        memberArray.forEach(node => memberList.appendChild(node))
        inputNode.value = ""
    }

    function cleanInputValue(str){
        pretty = toTitleCase(removeSymbols(str.trim())),
        value = pretty.toLowerCase().replace(" ","_")
        return {
            "pretty": pretty,
            "value": value
        }
    }

    function toTitleCase(str){
        return str.replace(/\w+\s*/g, match => {
            return match.charAt(0).toUpperCase() + match.substring(1).toLowerCase()
        })
    }
    
    function removeSymbols(str){
        return str.replace(/[^a-zA-Z0-9 \-_]/g, "")
    }

    function compareNodeValues(a, b){
        if(a.value < b.value){
            return -1
        }
        if(a.value > b.value){
            return 1
        }
        return 0
    }
}