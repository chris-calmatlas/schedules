
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

function saveLocal(key, obj){
    try{
        window.localStorage.setItem(key, JSON.stringify(obj))
    } catch (err) {
        console.error(`Warning ${key} could not be saved`)
        console.error(err)
    }
}

function restoreLocal(key){
    return JSON.parse(window.localStorage.getItem(key))
}

function toTitleCase(str){
    return str.replace(/\w+\s*/g, match => {
        return match.charAt(0).toUpperCase() + match.substring(1).toLowerCase()
    })
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

function separateNodesIntoRows(nodes, numberOfNodesPerRow){
    if(!numberOfNodesPerRow || numberOfNodesPerRow > 12){
        numberOfNodesPerRow = 7
    } 

    const nodesArray = Array.from(nodes)
    // splice the container array until there's nothing left. 
    while(nodesArray.length > 0){
        // Get the nodes that will go into the row
        const nodesArraySubset = nodesArray.splice(0, numberOfNodesPerRow)

        // Add shift containers to pad the end.
        while(nodesArraySubset.length < numberOfNodesPerRow){
            const newContainer = buildShiftContainer()
            nodesArraySubset.push(newContainer)
        }

        // Build the row and append it to the shift containers parent
        let row = document.createElement("div")
        row.className = "scheduleRow d-md-flex"
        nodesArraySubset[0].parentNode.appendChild(row)
        
        nodesArraySubset.forEach((node) => {
            // Add the shift containers to the row
            row.appendChild(node)
            node.classList.add("h-100")
            node.classList.add(`equal-md-width-${numberOfNodesPerRow}`)
        })
    }        
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

function buildScheduleContainer(startDateObject, endDateObject) {
    // Get the container
    const scheduleContainer = document.querySelector(".scheduleContainer")
    
    // Get all dates within this schedule
    const dateArray = dateUtils.getArrayOfDates(startDateObject, endDateObject)

    // Clear the old schedule and add the new
    scheduleContainer.innerHTML = ""
    dateArray.forEach((date) => {
        scheduleContainer.append(buildShiftContainer(date))
    })

    separateNodesIntoRows(document.querySelectorAll(".shiftContainer"))
}

function datePicker() {
    // functions
    function validateStartEndInputs(startInput, endInput) {
        // end value exists
        if(endInput.value){
            // start value also exists
            if(startInput.value){
                // Validate and correct
                if(endInput.value < startInput.value){ 
                    endInput.value = startInput.value
                    resetMessage(startInput).innerHTML = "Start date must be before end date"
                }
                return {
                    "startDate": startInput.valueAsDate,
                    "endDate": endInput.valueAsDate
                }
            }
        }
    }

    // Get date inputs
    const dateInputs = {
        "start": document.querySelector(".scheduleStart"),
        "end": document.querySelector(".scheduleEnd")
    }

    // listeners
    Object.values(dateInputs).forEach((value) => {
        value.addEventListener("change", () => {
            const scheduleBoundaries = validateStartEndInputs(dateInputs.start, dateInputs.end)
            if(scheduleBoundaries){
                saveLocal("scheduleBoundaries", scheduleBoundaries)
                buildScheduleContainer(scheduleBoundaries.startDate, scheduleBoundaries.endDate)
            }
        })
    })

    // Populate from local storage
    const restoredBoundaries = restoreLocal("scheduleBoundaries")
    if(restoredBoundaries){
        dateInputs.start.valueAsDate = new Date(restoredBoundaries.startDate)
        dateInputs.end.valueAsDate = new Date(restoredBoundaries.endDate)
        const scheduleBoundaries = validateStartEndInputs(dateInputs.start, dateInputs.end)
        if(scheduleBoundaries){
            buildScheduleContainer(scheduleBoundaries.startDate, scheduleBoundaries.endDate)
        }
    }
}

function memberManager(){
    // functions
    function removeSymbolsFromMemberName(str){
        return str.replace(/[^a-zA-Z0-9 \-_]/g, "")
    }

    function validateMemberName(str){
        const pretty = toTitleCase(removeSymbolsFromMemberName(str.trim()))
        const value = pretty.toLowerCase().replace(" ","_")
        return {
            "pretty": pretty,
            "value": value
        }
    }

    // Build an json like object and save it locally with member info
    function saveMembers(selectNode){
        const members = {}
        selectNode.childNodes.forEach((option) => {
            members[option.value] = option.innerHTML
        })
        saveLocal("members", members)
    }

    function addMember(inputNode){
        const message = resetMessage(inputNode)
        // No blanks
        if(!inputNode.value){
            message.innerHTML = "Type a name to add it to the member list"
            return
        }

        // Cleanup the input value 
        const cleanValue = validateMemberName(inputNode.value)
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
        const memberListArray = Array.from(memberList).sort(compareNodeValues)
        memberList.innerHTML = ""
        memberListArray.forEach(node => memberList.appendChild(node))
        inputNode.value = ""

        // Save locally
        saveMembers(memberList)
    }

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
            document.querySelector(".memberAddInput").value = ""
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

    // listeners
    document.querySelector(".memberAddButton").addEventListener("click", (event) => {
        event.preventDefault()
        addMember(document.querySelector(".memberAddInput"))
    })

    document.querySelector(".memberEditButton").addEventListener("click", (event) => {
        event.preventDefault()
        // Get selected members
        const memberList = document.querySelector(".memberList")
        const message = resetMessage(memberList)
        const existingMembers = memberList.querySelectorAll("option")
        const selectedMembersArray = Array.from(existingMembers).filter(node => node.selected)
        // Only allow one edit
        if(selectedMembersArray.length > 1){
            message.innerHTML = "Only one member can be edited at a time"
            return
        }
        if(selectedMembersArray.length < 1){
            message.innerHTML = "Select a member to edit"
            return
        }
        editMember(selectedMembersArray[0])
    })

    document.querySelector(".memberRemoveButton").addEventListener("click", (event) => {
        event.preventDefault()
        // Get selected members and remove
        const memberList = document.querySelector(".memberList")
        const message = resetMessage(memberList)
        const existingMembers = memberList.querySelectorAll("option")
        if(existingMembers){
            existingMembers.values().forEach(node => {
                if(node.selected){
                    message.innerHTML += `${node.innerHTML} deleted <br />`
                    node.remove()
                }
            })
        }
        saveMembers(memberList)
    })

    // Populate from local storage
    const restoredMembers = restoreLocal("members")
    if(restoredMembers){
        const memberAddInput = document.querySelector(".memberAddInput")
        Object.values(restoredMembers).forEach(memberName => {
            memberAddInput.value = memberName
            addMember(memberAddInput)
        })
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Setup the page
    datePicker()
    memberManager()
})