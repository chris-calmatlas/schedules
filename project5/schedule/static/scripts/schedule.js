
import * as dateUtils from "./dateUtils.js"

// Clears message class on the page and returns sibling .message
function resetMessage(siblingNode){
    try {
        document.querySelectorAll(".message").forEach(node => node.innerHTML = "")
        // Find a direct sibling with a .message class
        let parentNode = siblingNode.parentNode
        let messageNode = parentNode.querySelector(".message")
        // If a direct sibling wasn't found loop until one is.
        while(!messageNode){
            parentNode = parentNode.parentNode
            messageNode = parentNode.querySelector(".message")
        }
        
        return messageNode
    } catch (err) {
        console.error("Could not find message container")
        console.error(err)
        return siblingNode
    }
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
        const shiftContainer = document.createElement("div")
        const headerNode = document.createElement("div")
        const dayNode = document.createElement("h6")
        const dateNode = document.createElement("h6")
        const listContainer = document.createElement("div")
        const listNode = document.createElement("ul")
       
        // Build the structure and nesting
        shiftContainer.appendChild(headerNode)
        shiftContainer.appendChild(listContainer)
        headerNode.appendChild(dayNode)
        headerNode.appendChild(dateNode)
        listContainer.appendChild(listNode)

        // Add classes
        shiftContainer.className = `card shiftContainer`
        headerNode.className = "card-header text-center"
        dayNode.className = "scheduleDay"
        dateNode.className = "scheduleDate"
        listContainer.className = "card-body"
        listNode.className = "list-group list-group-flush"
        
        // Add data if we have it
        if(dateObject){
            shiftContainer.dataset.date = dateObject
            shiftContainer.classList.add(dateUtils.getDayName(dateObject.getDay()))
            shiftContainer.classList.add(dateUtils.getHtmlDateValueFormatString(dateObject))
            dayNode.innerHTML = dateUtils.getDayName(dateObject.getDay())
            dateNode.innerHTML = dateUtils.getPrettyDateFormatString(dateObject)
        } else {
           shiftContainer.classList.add("invisible")
        }

        return shiftContainer
    }

    function buildScheduleRows(shiftContainers, numberOfDaysPerRow){
        // Display the shift containers in rows
        if(!numberOfDaysPerRow || numberOfDaysPerRow > 12){
            numberOfDaysPerRow = 7
        } 

        const shiftContainerArray = Array.from(shiftContainers)
        // splice the container array until there's nothing left. 
        while(shiftContainerArray.length > 0){
            // Get the shiftContainers that will go into the row
            const shiftContainerSubset = shiftContainerArray.splice(0, numberOfDaysPerRow)

            // Add shift containers to pad the end.
            while(shiftContainerSubset.length < numberOfDaysPerRow){
                const newContainer = buildShiftContainer()
                shiftContainerSubset.push(newContainer)
            }

            // Build the row and append it to the shift containers parent
            let row = document.createElement("div")
            row.className = "scheduleRow d-md-flex"
            shiftContainerSubset[0].parentNode.appendChild(row)
            
            shiftContainerSubset.forEach((shiftContainer) => {
                // Add the shift containers to the row
                row.appendChild(shiftContainer)
                shiftContainer.classList.add("h-100")
                shiftContainer.classList.add(`equal-md-width-${numberOfDaysPerRow}`)
            })
        }        
    }

    function buildScheduleContainer(startInput, endInput) {
        const readyToBuild = validateStartEndDates(startInput, endInput)
        if(readyToBuild){
            // Get the container
            const scheduleContainer = document.querySelector(".scheduleContainer")
            
            // Get dates within this schedule
            const dateArray = dateUtils.getArrayOfDates(startInput.valueAsDate, endInput.valueAsDate, true)

            // Clear the old schedule and add the new
            scheduleContainer.innerHTML = ""
            dateArray.forEach((date) => {
                scheduleContainer.append(buildShiftContainer(date))
            })

            buildScheduleRows(document.querySelectorAll(".shiftContainer"))
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
        // Put member in the input and hide it in the list
        const memberAddInput = document.querySelector(".memberAddInput")
        memberAddInput.value = option.innerHTML
        option.hidden = true

        // Get existing buttons
        const memberList = document.querySelector(".memberList")
        const memberControlButtons = document.querySelectorAll(".memberControls button")
        const addButton = document.querySelector(".memberAddButton")

        // Create save Button
        const saveButton = memberControlButtons[0].cloneNode()
        saveButton.className = saveButton.className.replace(saveButton.Name, "memberSaveButton")
        saveButton.name = "memberSaveButton"
        saveButton.innerHTML = "Save"
        
        // Create cancel Button 
        const cancelButton = memberControlButtons[0].cloneNode()
        cancelButton.className = cancelButton.className.replace(cancelButton.Name, "memberCancelButton")
        cancelButton.name = "memberCancelButton"
        cancelButton.innerHTML = "Cancel"

        // Hide unneeded buttons, add new ones, and lock the select
        memberControlButtons.forEach(button => button.disabled = true)
        memberControlButtons[0].parentNode.appendChild(cancelButton)
        addButton.parentNode.appendChild(saveButton)
        addButton.hidden = true
        memberList.disabled = true

        // button functions
        function revertEdit(){
            memberControlButtons.forEach(button => button.disabled = false)
            saveButton.remove()
            cancelButton.remove()
            addButton.hidden = false
            memberList.disabled = false
        }

        // new button listeners
        saveButton.addEventListener("click", (event) => {
            event.preventDefault()
            // Make the change
            option.remove()
            addMember(document.querySelector(".memberAddInput"))

            revertEdit()
        })

        cancelButton.addEventListener("click", (event) => {
            event.preventDefault()
            // Bring back the name without an edit
            option.hidden = false
            revertEdit()

        })
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
        const pretty = toTitleCase(removeSymbols(str.trim()))
        const value = pretty.toLowerCase().replace(" ","_")
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