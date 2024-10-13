
import * as utils from "./utils.js"

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

function arrangeScheduleIntoRows(nodelist, numberOfNodesPerRow){
    if(!numberOfNodesPerRow || numberOfNodesPerRow > 12){
        numberOfNodesPerRow = 7
    } 

    const nodesArray = Array.from(nodelist)
    // splice the container array until there's nothing left. 
    while(nodesArray.length > 0){
        // Get the nodes that will go into the row
        const nodesArraySubset = nodesArray.splice(0, numberOfNodesPerRow)

        // Add shift containers to pad the end.
        while(nodesArraySubset.length < numberOfNodesPerRow){
            const newContainer = shiftContainer()
            nodesArraySubset.push(newContainer)
        }

        // Build the row and append it to the shift containers parent
        let row = document.createElement("div")
        row.className = "scheduleRow d-md-flex"
        nodesArraySubset[0].parentNode.appendChild(row)
        
        nodesArraySubset.forEach(node => {
            // Add the shift containers to the row
            row.appendChild(node)
            node.classList.add("h-100")
            node.classList.add(`equal-md-width-${numberOfNodesPerRow}`)
        })
    }        
}

function shiftContainer(dateObject){
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
        shiftContainer.classList.add(utils.getDayName(dateObject.getDay()))
        shiftContainer.classList.add(utils.getISODateString(dateObject))
        dayNode.innerHTML = utils.getDayName(dateObject.getDay())
        dateNode.innerHTML = utils.getPrettyDateFormatString(dateObject)
    } else {
       shiftContainer.classList.add("invisible")
    }
    return shiftContainer
}

function fillScheduleContainer(scheduleBoundaries) {
    // Get the container
    const scheduleContainer = document.querySelector(".scheduleContainer")
    
    // Get all dates within this schedule
    const dateArray = utils.getArrayOfDates(scheduleBoundaries.start, scheduleBoundaries.end)

    // Clear the old schedule and add the new
    scheduleContainer.innerHTML = ""
    dateArray.forEach(date => {
        scheduleContainer.append(shiftContainer(date))
    })

    arrangeScheduleIntoRows(document.querySelectorAll(".shiftContainer"))
    enableShiftBuilder(scheduleBoundaries)
}

function normalizeScheduleBoundaries(dateInputs) {
    const startDate = dateInputs.start.valueAsDate
    const endDate = dateInputs.end.valueAsDate
    const startInput = dateInputs.start
    const endInput = dateInputs.end

    // Max 1 year
    const maxSpan = 31536000000
    if(startDate){
        endInput.min = utils.getISODateString(startDate)
        endInput.max = utils.getISODateString(new Date(startDate.getTime() + maxSpan))
        // start and end
        if(endDate < startDate){
            endInput.valueAsDate = startDate
        }
    } else if (endDate){
        const now = new Date()
        // An end date in the future with no start date should set the start date to today
        if(endDate > now){
            now.setHours(new Date(endDate).getHours())
            now.setMinutes(new Date(endDate).getMinutes())
            now.setSeconds(0)
            now.setMilliseconds(0)
            // Don't allow end date to be further than maxSpan from start date
            if (endDate.getTime() - maxSpan > now.getTime()){
                startInput.valueAsDate = new Date(endDate.getTime() - maxSpan)
                startInput.min = utils.getISODateString(endDate.getTime() - maxSpan)
            } else {
                startInput.valueAsDate = now
            }
        } else {
            // End date is in the past, if we get here there is no start date
            // Set the start date to the end date
            startInput.valueAsDate = endDate
        }
    } else {
        endInput.removeAttribute("min")
        endInput.removeAttribute("max")
        startInput.removeAttribute("min")
    }

    return {
        "start": startInput.valueAsDate,
        "end": endInput.valueAsDate
    }
}

// Build an array of member objects from our members select node and save locally
function saveMemberSelectNode(selectNode){
    const members = []
    selectNode.querySelectorAll("option").forEach(option => {
        members.push({
            "id": option.value,
            "name": option.innerHTML
        })
    })
    utils.saveLocalJson("members", members)
}

// Todo
function getMemberNameFromId(id){
    return memberId
}

// Add an option to the select node with the member info
// return a string message if there is an error
function addMemberById(id, str){
    const memberId = id
    const memberName = str

    // If a name was given use it, otherwise look it up
    if(!memberName){
        memberName = getMemberNameFromId(memberId)
    }
    
    // Check for duplicate in the list
    const memberSelectNode = document.querySelector(".memberList")
    const existingMembers = memberSelectNode.querySelectorAll("option")
    if(existingMembers){
        if(existingMembers.values().find(x => x.value === memberId)){
            return `${memberName} already exists`
        }
    }

    // Add new member to members list
    const newMember = document.createElement("Option")
    newMember.innerHTML = memberName
    newMember.value = memberId
    memberSelectNode.appendChild(newMember)
    
    // Sort select node and redraw
    const optionNodeArray = Array.from(memberSelectNode).sort(utils.compareNodeValues)
    memberSelectNode.innerHTML = ""
    optionNodeArray.forEach(node => memberSelectNode.appendChild(node))

    // Save locally
    saveMemberSelectNode(memberSelectNode)
}

function scheduleDatePicker() {
    // Get date inputs
    const dateInputs = {
        "start": document.querySelector(".scheduleStart"),
        "end": document.querySelector(".scheduleEnd")
    }

    // listeners
    Object.values(dateInputs).forEach(value => {
        value.addEventListener("change", () => {
            const scheduleBoundaries = normalizeScheduleBoundaries(dateInputs)
            if(scheduleBoundaries){
                utils.saveLocalJson("scheduleBoundaries", scheduleBoundaries)
                fillScheduleContainer(scheduleBoundaries)
            }
        })
    })
}

function memberManager(){
    // clean memberInput
    function cleanMemberInput(str){
        return str.trim().replace(/[^a-zA-Z0-9 \-_]/g, "")
    }

    function prettyMemberName(str){
        return utils.toTitleCase(str)
    }

    function convertNameToLocalId(str){
        return str.toLowerCase().replace(" ","_")
    }

    function addMemberFromInputNode(inputNode){
        const message = resetMessage(inputNode)
        // No blanks
        if(!inputNode.value){
            message.innerHTML = "Type a name to add it to the member list"
            return
        }

        // Cleanup the input value
        const cleanInput = cleanMemberInput(inputNode.value)
        const memberName = prettyMemberName(cleanInput)
        const memberId = convertNameToLocalId(memberName)

        const err = addMemberById(memberId, memberName)
        if(err){
            message.innerHTML = err
        }
    }

    function editMemberOption(option){
        // Put member in the input and hide it in the list
        const memberAddInput = document.querySelector(".memberAddInput")
        memberAddInput.value = option.innerHTML
        option.hidden = true

        // Get existing buttons
        const memberSelectNode = document.querySelector(".memberList")
        const memberControlButtons = document.querySelectorAll(".memberControls button")
        const memberAddButton = document.querySelector(".memberAddButton")

        // Create save Button. Clone another control button for consistency
        const saveButton = memberControlButtons[0].cloneNode()
        saveButton.className = saveButton.className.replace(saveButton.Name, "memberSaveButton")
        saveButton.name = "memberSaveButton"
        saveButton.innerHTML = "Save"
        
        // Create cancel Button. Clone another control button for consistency
        const cancelButton = memberControlButtons[0].cloneNode()
        cancelButton.className = cancelButton.className.replace(cancelButton.Name, "memberCancelButton")
        cancelButton.name = "memberCancelButton"
        cancelButton.innerHTML = "Cancel"

        // Hide unneeded buttons, add new ones, and lock the select
        memberControlButtons.forEach(button => button.disabled = true)
        memberControlButtons[0].parentNode.appendChild(cancelButton)
        memberAddButton.parentNode.appendChild(saveButton)
        memberAddButton.hidden = true
        memberSelectNode.disabled = true

        // button functions
        function revertEdit(){
            document.querySelector(".memberAddInput").value = ""
            memberControlButtons.forEach(button => button.disabled = false)
            saveButton.remove()
            cancelButton.remove()
            memberAddButton.hidden = false
            memberSelectNode.disabled = false
        }

        // new button listeners
        saveButton.addEventListener("click", event => {
            event.preventDefault()
            // Make the change
            option.remove()
            addMemberFromInputNode(document.querySelector(".memberAddInput"))
            revertEdit()
        })

        cancelButton.addEventListener("click", event => {
            event.preventDefault()
            // Bring back the name without an edit
            option.hidden = false
            revertEdit()
        })
    }

    // listeners
    document.querySelector(".memberList").addEventListener("change", event => {
        const shiftBuilderInfo = document.querySelector(".shiftBuilder .selectedMembers")
        if(event.target.selectedOptions.length != 0){
            const selectedOptions = Array.from(event.target.selectedOptions)
            shiftBuilderInfo.innerHTML = ""
            selectedOptions.forEach(option => {
                const li = document.createElement("li")
                li.innerHTML = option.innerHTML
                shiftBuilderInfo.appendChild(li)
            })
        } else {
            shiftBuilderInfo.innerHTML = "No members selected"
        }
    })

    document.querySelector(".memberAddButton").addEventListener("click", event => {
        event.preventDefault()
        addMemberFromInputNode(document.querySelector(".memberAddInput"))
    })

    document.querySelector(".memberEditButton").addEventListener("click", event => {
        event.preventDefault()
        // Get selected members
        const memberSelectNode = document.querySelector(".memberList")
        const message = resetMessage(memberSelectNode)
        const existingMembers = memberSelectNode.querySelectorAll("option")
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
        editMemberOption(selectedMembersArray[0])
    })

    document.querySelector(".memberRemoveButton").addEventListener("click", event => {
        event.preventDefault()
        // Get selected members and remove
        const memberSelectNode = document.querySelector(".memberList")
        const message = resetMessage(memberSelectNode)
        const existingMembers = memberSelectNode.querySelectorAll("option")
        if(existingMembers){
            existingMembers.values().forEach(node => {
                if(node.selected){
                    message.innerHTML += `${node.innerHTML} deleted <br />`
                    node.remove()
                }
            })
        }
        saveMemberSelectNode(memberSelectNode)
    })
}

function enableShiftBuilder(scheduleBoundaries){
    if(scheduleBoundaries){
        // Get time inputs
        const dateTimeInputs = {
            "start": document.querySelector(".shiftStart"),
            "end": document.querySelector(".shiftEnd")
        }
        dateTimeInputs.start.min = utils.getISODateTimeString(scheduleBoundaries.start)
        dateTimeInputs.end.min = utils.getISODateTimeString(scheduleBoundaries.start)
        dateTimeInputs.start.max = utils.getISODateTimeString(scheduleBoundaries.end)
        dateTimeInputs.end.max = utils.getISODateTimeString(scheduleBoundaries.end)
        document.querySelector(".shiftBuilder").disabled = false
    }
}

function shiftBuilder(){
    function saveShiftDivNode(divNode){
        const shifts = []
        divNode.querySelectorAll("li").forEach(li => {
            shifts.push({
                "id": li.dataset.id,
                "member": li.querySelector(".memberName"),
                "startTime": li.querySelector(".startTime").innerHTML,
                "endTime": li.querySelector(".endTime").innerHTML
            })
        })
    }

    function displayShiftLength(shiftBoundaries){
        if (shiftBoundaries){
            const shiftLengthContainer = document.querySelector(".shiftLength")
            const shiftLength = utils.getDuration(shiftBoundaries.start, shiftBoundaries.end).part
            const duration = {
                weeks: shiftLength.weeks,
                days: shiftLength.days,
                hours: shiftLength.hours,
                minutes: shiftLength.minutes
            }
            shiftLengthContainer.innerHTML = new Intl.DurationFormat().format(duration)
        }        
    }

    // Get time inputs
    const dateTimeInputs = {
        "start": document.querySelector(".shiftStart"),
        "end": document.querySelector(".shiftEnd")
    }

    function normalizeShiftBoundaries(dateTimeInputs){
        const startInput = dateTimeInputs.start
        const endInput = dateTimeInputs.end

        const scheduleInputs = {
            "start": document.querySelector(".scheduleStart"),
            "end": document.querySelector(".scheduleEnd")
        }
        const scheduleBoundaries = normalizeScheduleBoundaries(scheduleInputs)

        if(startInput.valueAsNumber){
            if(startInput.valueAsNumber < scheduleBoundaries.start){
                startInput.valueAsNumber = scheduleBoundaries.start.getTime()
            }
            if(startInput.valueAsNumber > scheduleBoundaries.end){
                startInput.valueAsNumber = scheduleBoundaries.end.getTime()
            }
            // start and end
            if(endInput.valueAsNumber < startInput.valueAsNumber){
                endInput.valueAsNumber = startInput.valueAsNumber
            }
        } else if (endInput.valueAsNumber){
            // An end time with no start time should set the start time to the schedule start
            if(endInput.valueAsNumber > scheduleBoundaries.start){
                console.log("here")
                startInput.valueAsNumber = scheduleBoundaries.start.getTime()
            } else {
                endInput.valueAsNumber = scheduleBoundaries.start.getTime()
                startInput.valueAsNumber = scheduleBoundaries.start.getTime()
            }
        }

        return {
            "start": startInput.valueAsNumber,
            "end": endInput.valueAsNumber
        }
    }

    document.querySelectorAll(".dateTimeInputs input").forEach(input => {
        input.addEventListener("change", () => {
            const shiftBoundaries = normalizeShiftBoundaries(dateTimeInputs)
            displayShiftLength(shiftBoundaries)
        })
    })

    document.querySelector(".shiftAddButton").addEventListener("click", event => {
        event.preventDefault()
    })
}

function restoreFromLocalStorage(){
    // Populate from local storage
    const restoredBoundaries = utils.restoreLocalJson("scheduleBoundaries")
    if(restoredBoundaries){
        const dateInputs = {
            "start": document.querySelector(".scheduleStart"),
            "end": document.querySelector(".scheduleEnd")
        }
        dateInputs.start.valueAsDate = new Date(restoredBoundaries.start)
        dateInputs.end.valueAsDate = new Date(restoredBoundaries.end)
        const scheduleBoundaries = normalizeScheduleBoundaries(dateInputs)
        if(scheduleBoundaries){
            fillScheduleContainer(scheduleBoundaries)
        }
    }

    // Populate from local storage
    const restoredMembers = utils.restoreLocalJson("members")
    if(restoredMembers){
        restoredMembers.forEach(restoredMember => {
            addMemberById(restoredMember.id, restoredMember.name)
        })
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".clearLocalStorage").addEventListener("click", () => {
        window.localStorage.clear()
        window.location.reload()

    })
    scheduleDatePicker()
    memberManager()
    shiftBuilder()
    restoreFromLocalStorage()
})