document.addEventListener("DOMContentLoaded", () => {
    scheduleBuilder()
    memberManager()
})

function scheduleBuilder() {
    // listeners
    document.querySelector(".scheduleStart").addEventListener("change", (event) => {
        validateStartEnd(event.target, document.querySelector(".scheduleEnd"))
    })

    document.querySelector(".scheduleEnd").addEventListener("change", (event) => {
        validateStartEnd(document.querySelector(".scheduleStart"), event.target)
    })

    // functions
    function validateStartEnd(start, end) {
        if(!start.value){start.valueAsNumber = Date.now()}
        if(end.value){
            if(start.valueAsDate > end.valueAsDate){end.value = start.value}
        }
        buildSchedule(start.valueAsDate, end.valueAsDate)
    }

    function buildSchedule(startDate, endDate) {
        const scheduleContainer = document.querySelector(".scheduleContainer")
        scheduleContainer.innerHTML = startDate.getDay()
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
        const existingMembers = memberList.querySelectorAll("option")
        const message = memberList.parentNode.querySelector(".message")
        message.innerHTML = ""
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
        const message = inputNode.parentNode.querySelector(".message")
        message.innerHTML = ""
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
