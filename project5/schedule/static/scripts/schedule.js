
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
        
        nodesArraySubset.forEach(node => {
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
        shiftContainer.classList.add(utils.getDayName(dateObject.getDay()))
        shiftContainer.classList.add(utils.getHtmlDateValueFormatString(dateObject))
        dayNode.innerHTML = utils.getDayName(dateObject.getDay())
        dateNode.innerHTML = utils.getPrettyDateFormatString(dateObject)
    } else {
       shiftContainer.classList.add("invisible")
    }

    return shiftContainer
}

function buildScheduleContainer(startDateObject, endDateObject) {
    // Get the container
    const scheduleContainer = document.querySelector(".scheduleContainer")
    
    // Get all dates within this schedule
    const dateArray = utils.getArrayOfDates(startDateObject, endDateObject)

    // Clear the old schedule and add the new
    scheduleContainer.innerHTML = ""
    dateArray.forEach(date => {
        scheduleContainer.append(buildShiftContainer(date))
    })

    separateNodesIntoRows(document.querySelectorAll(".shiftContainer"))
}

function normalizeDateInputs(startInput, endInput) {
    const results = {
        "Start and End": () => {
            if(endInput.valueAsDate < startInput.valueAsDate){ 
                endInput.valueAsDate = startInput.valueAsDate
            }
            return {
                "startDate": startInput.valueAsDate,
                "endDate": endInput.valueAsDate
            }
        },
    
        "Start Only": () => {
            endInput.valueAsDate = startInput.valueAsDate
            return {
                "startDate": startInput.valueAsDate,
                "endDate": endInput.valueAsDate
            }
        },
    
        "End Only": () => {
            const now = new Date()
            if(endInput.valueAsDate > now){
                startInput.valueAsDate = now
            } else {
                startInput.valueAsDate = endInput.valueAsDate
            }

            return {
                "startDate": startInput.valueAsDate,
                "endDate": endInput.valueAsDate
            }
        }, 

        "No Dates": () => {
            return
        }
    }

    const boundaryCheck = utils.checkDateBoundaries(startInput.valueAsDate, endInput.valueAsDate)
    return results[boundaryCheck]()
}

function normalizeTimeInputs(startInput, endInput) {
    const results = {
        "Start and End": () => {
            return {
                "startTime": new Date(startInput.valueAsNumber),
                "endTime": new Date(endInput.valueAsNumber)
            }
        },
    
        "Start Only": () => {
            // Add an hour
            endInput.valueAsNumber = startInput.valueAsNumber + 3600000
            return {
                "startTime": new Date(startInput.valueAsNumber),
                "endTime": new Date(endInput.valueAsNumber)
            }
        },
    
        "End Only": () => {
            return
        }, 

        "No Dates": () => {
            return
        }
    }

    const boundaryCheck = utils.checkDateBoundaries(new Date(startInput.valueAsNumber), new Date(endInput.valueAsNumber))
    return results[boundaryCheck]()
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
            const scheduleBoundaries = normalizeDateInputs(dateInputs.start, dateInputs.end)
            if(scheduleBoundaries){
                utils.saveLocalJson("scheduleBoundaries", scheduleBoundaries)
                buildScheduleContainer(scheduleBoundaries.startDate, scheduleBoundaries.endDate)
            }
        })
    })

    // Populate from local storage
    const restoredBoundaries = utils.restoreLocalJson("scheduleBoundaries")
    if(restoredBoundaries){
        dateInputs.start.valueAsDate = new Date(restoredBoundaries.startDate)
        dateInputs.end.valueAsDate = new Date(restoredBoundaries.endDate)
        const scheduleBoundaries = normalizeDateInputs(dateInputs.start, dateInputs.end)
        if(scheduleBoundaries){
            buildScheduleContainer(scheduleBoundaries.startDate, scheduleBoundaries.endDate)
        }
    }
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

    // Populate from local storage
    const restoredMembers = utils.restoreLocalJson("members")
    if(restoredMembers){
        restoredMembers.forEach(restoredMember => {
            addMemberById(restoredMember.id, restoredMember.name)
        })
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

    function validateShiftBoundaryInputs(dayInputs, timeInputs){
        // Set shift days before checking times.
        const dayBoundaries = normalizeDateInputs(dayInputs.start, dayInputs.end)
        if(dayBoundaries){
            const timeBoundaries = normalizeTimeInputs(timeInputs.start, timeInputs.end)
            if(timeBoundaries){
                // Add a day if we need to
                if(dayBoundaries.startDate.getTime() == dayBoundaries.endDate.getTime()){
                    if(timeBoundaries.endTime.getTime() <= timeBoundaries.startTime.getTime()){
                        dayInputs.end.valueAsDate = utils.getNextDate(dayInputs.end.valueAsDate)
                        dayBoundaries.endDate = dayInputs.end.valueAsDate
                    }
                }
                return{
                    "start": new Date(timeBoundaries.startTime.getTime() + dayBoundaries.startDate.getTime()),
                    "end": new Date(timeBoundaries.endTime.getTime() + dayBoundaries.endDate.getTime())
                } 
            }
        }
    }

    function displayShiftLength(shiftBoundaries){
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

    // Get day inputs
    const dayInputs = {
        "start": document.querySelector(".shiftStartDay"),
        "end": document.querySelector(".shiftEndDay")
    }

    // Get time inputs
    const timeInputs = {
        "start": document.querySelector(".shiftStartTime"),
        "end": document.querySelector(".shiftEndTime")
    }

    // listeners
    document.querySelectorAll(".dateTimeInputs input").forEach(input => {
        input.addEventListener("change", () => {
            const shiftBoundaries = validateShiftBoundaryInputs(dayInputs, timeInputs)
            if(shiftBoundaries){
                displayShiftLength(shiftBoundaries)
            }
        })
    })

    document.querySelector(".shiftAddButton").addEventListener("click", event => {
        event.preventDefault()
    })
}

document.addEventListener("DOMContentLoaded", () => {
    // Setup the page
    document.querySelector(".clearLocalStorage").addEventListener("click", () => {
        window.localStorage.clear()
        window.location.reload()

    })
    scheduleDatePicker()
    memberManager()
    shiftBuilder()
})