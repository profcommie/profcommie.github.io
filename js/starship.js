/*
Brian Harkless
Star Trek Adventures Starship Character Sheet
TO DO LIST:
//Better implementation than textarea for display of traits weapons and talents - multiselect box
//    Requires rewrite of handlers, updateStats, switch statement, and import.
//Would like to be able to remove entries from the above by clicking them and then clicking a remove button multiselect/combo box - implemented for weapon
Weapon damages should adjust when Security score changes
//Edit button triggers editable on Name, Class and Profile - Done
Add nonship building fields (power, shields, etc) Pg 259
    Shields = structure + security + talents
    Resistance = Scale + talents
    Power = Engines + talents
    Crew Support = Scale + talents
    Launch Bay = available shuttles but not well defined in the book itself, maybe something for players to fill in if they feel like it.
    Bridge Stations
Add picture of ships when Class is selected
Clicking on talent explains what it does
Admin tab? Allow DM to add traits and talents? Would need to track as part of the ship, possibly a separate save file... Might be something to modify if I ever add a backend/serverside element to this for tracking ships in the cloud. appstate
Need to find out how to change the filetype on the output file from txt to JSON or something
*/

var ship = {
    name:"",
    class:"",
    scale:0,
    //systems[comms, engines, structure, computers, sensors, weapons]
    systems:[0,0,0,0,0,0],
    //departments[command, security, science, conn, engineering, medicine]
    departments:[0,0,0,0,0,0],
    weaponry:{
        name:[],
        damage:[],
        qualities:[]
    },
    talents:[],
    traits:[],//convert to array
    profileVals:[0,0,0,0,0,0],
    missionProfile:""
};

let editFlag = false;
let newFlag = false;
let starDate = 2371;
let inserviceDate = 2017;
let numRefits = 0;            
let buttons = [commsUpButtontd, commsDownButtontd, engineUpButtontd, engineDownButtontd, strucUpButtontd, strucDownButtontd, compUpButtontd, compDownButtontd, sensUpButtontd, sensDownButtontd, weapUpButtontd, weapDownButtontd, 
                cmdUpButtontd, cmdDownButtontd, connUpButtontd, connDownButtontd, secUpButtontd, secDownButtontd, engUpButtontd, engDownButtontd, sciUpButtontd, sciDownButtontd, medUpButtontd, medDownButtontd, 
                traitRow, talentRow, weaponRow, torpedoRow, setNameButtonTd, setClassButtonTd, missionProfileButtonTd, shipClassTd, missionProfileSelectTd, shipNameTd, removeWeaponButtonTd, removeTalentButtonTd, removeTraitButtonTd]; 

let profiles = {
    "Strategic and Diplomatic Operations":[3,2,2,1,2,2],
    "Pathfinder and Reconnaissance Operations":[2,2,2,3,2,1],
    "Technical Testbed":[1,2,2,2,3,2],
    "Tactical Operations":[2,3,1,2,2,2],
    "Scientific and Survey Operations":[2,1,3,2,2,2],
    "Crisis and Emergency Response":[2,2,2,2,1,3],
    "Multirole Explorer":[2,2,2,2,2,2]
};

let talentChoices = ["Ablative Armor", "Advanced Research Facilities", "Advanced Sensor Suites", "Advanced Shields", "Advanced Sickbay", "Backup EPS Conduits", "Command Ship", "Diplomatic Suites", "Electronic Warfare Systems", "Emergency Medical Hologram", "Extensive Shuttlebays", "Fast Targeting Systems", "High Resolution Sensors", "Improved Damage Control", "Improved Hull Integrity", "Improved Impulse Drive", "Improved Power Systems", "Improved Reaction Control System", "Improved Shield Recharge", "Improved Warp Drive", "Modular Laboratories", " Quantum Torpedoes", "Rapid-Fire Torpedo Launcher", "Redundant Systems", "Rugged Design", "Saucer Separation", "Secondary Reactors"];


let profilesChoices = {
    "Strategic and Diplomatic Operations":`<option>Command Ship</option>\n<option>Diplomatic Suites</option>\n<option>Electronic Warfare Systems</option>\n<option>Extensive Shuttlebays</option>`,
    "Pathfinder and Reconnaissance Operations":`<option>Improved Reaction Control System</option>\n<option>Improved Warp Drive</option>\n<option>Rugged Design</option>`,
    "Technical Testbed":`<option>Advanced Shields</option>\n<option>Backup EPS Conduits</option>\n<option>High Resolution Sensors</option>\n<option>Improved Power Systems</option>\n<option>Improved Warp Drive</option>`,
    "Tactical Operations":`<option>Ablative Armor</option>\n<option>Fast Targeting Systems</option>\n<option>Improved Damage Control</option>\n<option>Quantum Torpedoes</option>\n<option>Improved Impulse Drive</option>`,
    "Scientific and Survey Operations":`<option>Advanced Research Facilities</option>\n<option>Advanced Sensor Suites</option>\n<option>High Resolution Sensors</option>\n<option>Modular Laboratories</option>`,
    "Crisis and Emergency Response":`<option>Advanced Sickbay</option>\n<option>Emergency Medical Hologram</option>\n<option>Extensive Shuttlebays</option>\n<option>Modular Laboratories</option>`,
    "Multirole Explorer":`<option>Improved Hull Integrity</option>\n<option>Improved Power Systems</option>\n<option>Rugged Design</option>\n<option>Redundant Systems</option>\n<option>Secondary Reactors</option>`
};

let weapQual = {
    "Photon Torpedo":"High Yield",
    "Quantum Torpedo":"Calibration, High Yield",
    "Plasma Torpedo":"Calibration",
    "Phaser":"Versatile 2",
    "Disruptor":"Vicious 1",
    "Phased Polaron Beam": "",
};

let weapDamage = {
    "Cannons":2,
    "Banks":1,
    "Arrays":0,
    "Photon Torpedo":3,
    "Quantum Torpedo":4,
    "Plasma Torpedo":3
};

let weapRange = {
    "Cannons":"Close",
    "Banks": "Medium",
    "Arrays": "Medium"
};

function download(filename, text) {
    console.log("download fired");
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename+".ship");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function loadHandler() {
    console.log("loadHandler fired");
    newButton.hidden = true;
    loadFile.hidden = false;
    importButton.hidden = false;
    loadButton.hidden = true;
    cancelButton.hidden = false;
    newFlag = false;
}

function newHandler() {
    console.log("newHandler fired");
    newButton.hidden = true;
    loadButton.hidden = true;
    loadFile.hidden = true;
    importButton.hidden = true;
    cancelButton.hidden = true;
    charSheet.hidden = false;
    missionProfileSelectTd.hidden = false;
    missionProfileButtonTd.hidden = false;
    missionProfileTextTd.hidden = true;
    missionProfileButton.disabled = true;
    setClassButtonTd.hidden = false;
    setNameButtonTd.hidden = false;
    removeWeaponButtonTd.hidden = true;

    newFlag = true;
}

function cancelHandler() {
    console.log("cancelHandler fired");
    newButton.hidden = false;
    loadButton.hidden = false;
    loadFile.hidden = true;
    importButton.hidden = true;

    shipClassTd.hidden = false;
    shipClassTextTd.hidden = true;

    shipNameTextTd.hidden = true;
    shipNameTd.hidden = false;

    cancelButton.hidden = true;
    charSheet.hidden = true;

    profileTalentTr.hidden = true;
    
    ship.name = "";
    ship.class = "";
    ship.scale = 0;
    ship.weaponry.name = [];
    ship.weaponry.damage = [];
    ship.weaponry.qualities = [];
    ship.talents = [];
    ship.traits = [];

    for(let i = 0; i < 6; i++){
        ship.systems[i] = 0;
        ship.departments[i] = 0;
    }

    shipClass.value = "Akira";
    missionProfile.value = "Strategic and Diplomatic Operations";
    updateStats();

    talentDisplay.value = "";

    if(editFlag){
        editHandler();
    }

}

function downloadHandler() {
    console.log("downloadHandler fired");
    let jsonShip = JSON.stringify(ship);
    download(ship.name, jsonShip);    
}


function importHandler() {
    console.log("importHandler fired");
    var files = document.getElementById('loadFile').files;
    console.log(files);
    if (files.length <= 0) {
        return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) { 
        console.log(e);
        var myship = JSON.parse(e.target.result);
        ship.name = myship.name;
        ship.class = myship.class;
        ship.scale = myship.scale;
        ship.weaponry.name = myship.weaponry.name;
        ship.weaponry.damage = myship.weaponry.damage;
        ship.weaponry.qualities = myship.weaponry.qualities;
        ship.talents = myship.talents;
        ship.traits = myship.traits;
        ship.missionProfile = myship.missionProfile;
        for(let i = 0; i < 6; i++){
            ship.systems[i] = myship.systems[i];
            ship.departments[i] = myship.departments[i];
        }
        updateStats();

        shipNameTd.hidden = true;
        setNameButtonTd.hidden = true;
        shipNameTextTd.textContent = ship.name;
        shipNameTextTd.hidden = false;

        shipClassTd.hidden = true;
        setClassButtonTd.hidden = true;
        shipClassTextTd.textContent = ship.class;
        shipClassTextTd.hidden = false;

        missionProfileSelectTd.hidden = true;
        missionProfileTextTd.textContent = ship.missionProfile;
        missionProfileTextTd.hidden = false;
        missionProfileButtonTd.hidden = true;


    };

    fr.readAsText(files.item(0));
    
    loadFile.hidden = true;
    importButton.hidden = true;
    cancelButton.hidden = true;
    charSheet.hidden = false;
}

function editHandler() {
    console.log("editHandler fired");
    for(let btn in buttons){
        buttons[btn].hidden = editFlag;
    }
    shipNameTextTd.hidden = !editFlag;
    shipClassTextTd.hidden = !editFlag;
    missionProfileTextTd.hidden = !editFlag;
    shipName.value = ship.name;
    shipClass.value = ship.class;
    missionProfile.value = ship.missionProfile;

    editFlag = !editFlag;
}

function systIncrease(statID,stat){
    return function() {
        console.log(ship.systems[stat]);
        if(ship.systems[stat]<11){
            ship.systems[stat]++;
        } else if(ship.systems[stat] === 11 && !twelveExists()){
            ship.systems[stat]++;
        } else {
            alert("Only one system may be at 12, and 12 is the max for any one system");
        }
        updateStats();
    };
}

function systDecrease(statID,stat){
    return function() {
        console.log(ship.systems[stat]);
        if(ship.systems[stat] > 0){
            ship.systems[stat]--;
        }
        updateStats();
    };
}

function deptIncrease(statID,stat){
    return function() {
        console.log(ship.departments[stat]);
        if(ship.departments[stat]<12){
            ship.departments[stat]++;
        }
        updateStats();
    };
}

function deptDecrease(statID,stat){
    return function() {
        console.log(ship.departments[stat]);
        if(ship.departments[stat] > 0){
            ship.departments[stat]--;
        }
        updateStats();
    };
}

function setClassHandler() {
    console.log("setClassHandler fired");

        shipClassTd.hidden = true;
        setClassButtonTd.hidden = true;
        let newClass = shipClass.value;
        ship.class = newClass;
        shipClassTextTd.textContent = ship.class;
        shipClassTextTd.hidden = false;


        switch(ship.class){
            case "Akira": 
                ship.scale = 5;
                ship.systems = [9,10,11,9,9,11];
                ship.departments = [0,2,0,0,0,1];
                addTrait("Federation Ship");
                addWeapon("Phaser Arrays", ship.scale + ship.departments[1], weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 4");
                addTalent("Ablative Armor");
                addTalent("Extensive Shuttlebays");
                addTalent("Rapid Fire Torpedo Launcher");
                inserviceDate = 2368;
                break;
            case "Constellation":  
                ship.scale = 4;
                ship.systems = [8,9,8,7,9,9];
                ship.departments = [0,1,0,1,1,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Banks", ship.scale + ship.departments[1] + 1, weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 2");
                addTalent("Improved Warp Drive");
                addTalent("xtensive Shuttlebays");
                inserviceDate = 2285;
                break;
            case "Constitution":  
                ship.scale = 4;
                ship.systems = [7,8,8,7,8,8];
                ship.departments = [1,1,1,0,0,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Banks", ship.scale + ship.departments[1] + 1, weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 3");
                addTalent("Rugged Design");
                addTalent("Modular Laboratories");
                inserviceDate = 2243;
                break;
            case "Defiant":  
                ship.scale = 3;
                ship.systems = [9,10,8,9,9,13];
                ship.departments = [0,2,0,1,0,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Arrays", ship.scale + ship.departments[1], weapQual["Phaser"]);
                addWeapon("Phaser Cannon", ship.scale + ship.departments[1] +2, weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Quantum Torpedo", ship.departments[1] + 4, weapQual["Quantum Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 2");
                addTalent("Ablative Armor");
                addTalent("Quantum Torpedoes");
                inserviceDate = 2371;
                break;
            case "Excelsior":  
                ship.scale = 5;
                ship.systems = [8,9,9,8,8,9];
                ship.departments = [1,0,0,0,2,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Banks", ship.scale + ship.departments[1] + 1, weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 4");
                addTalent("Improved Impulse Drive");
                addTalent("Secondary Reactors");
                inserviceDate = 2285;
                break;
            case "Galaxy":  
                ship.scale = 6;
                ship.systems = [9,10,10,10,9,10];
                ship.departments = [1,0,1,0,0,1];
                addTrait("Federation Ship");
                addWeapon("Phaser Arrays", ship.scale + ship.departments[1], weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 5");
                addTalent("Saucer Separation");
                addTalent("Modular Laboratories");
                addTalent("Redundant Systems");
                inserviceDate = 2359;
                break;
            case "Intrepid":  
                ship.scale = 4;
                ship.systems = [10,11,8,11,10,9];
                ship.departments = [0,0,2,1,0,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Arrays", ship.scale + ship.departments[1], weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 3");
                addTalent("Improved Warp Drive");
                addTalent("Advanced Sensor Suites");
                addTalent("Emergency Medical Hologram");
                inserviceDate = 2371;
                break;
            case "Miranda": 
                ship.scale = 4;
                ship.systems = [8,8,8,8,9,9];
                ship.departments = [1,0,1,1,0,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Banks", ship.scale + ship.departments[1] + 1, weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 3");
                addTalent("Extensive Shuttlebays");
                inserviceDate = 2274;
                break;
            case "Nova":  
                ship.scale = 3;
                ship.systems = [10,9,8,10,10,8];
                ship.departments = [0,0,2,0,1,0];
                addTrait("Federation Ship");
                addWeapon("Phaser Arrays", ship.scale + ship.departments[1], weapQual["Phaser"]);
                addWeapon("Photon Torpedo", ship.departments[1] + 3, weapQual["Photon Torpedo"]);
                addWeapon("Tractor Beam", 0, "Strength 2");
                addTalent("Advanced Sensors");
                inserviceDate = 2368;
                break;

        }

        missionProfileButton.disabled = false;
        updateStats();
        

}

function setNameHandler() {
    console.log("setNameHandler fired");
        shipNameTd.hidden = true;
        setNameButtonTd.hidden = true;
        let newName = shipName.value;
        console.log(newName);
        ship.name = String(newName);
        shipNameTextTd.textContent = ship.name;
        shipNameTextTd.hidden = false;
}


function weaponHandler(weapType) {
    return function() {
        if(weapType === "weapon") {
            //for(let w in ship.weaponry.name) {
                if(ship.weaponry.name.includes(typeSelect.value + " " + deliverySelect.value)){
                    return;
                }
            //}
            console.log(ship.scale + ship.departments[1] + weapDamage[deliverySelect.value]);
            addWeapon(typeSelect.value + " " + deliverySelect.value, ship.scale + ship.departments[1] + weapDamage[deliverySelect.value], weapQual[typeSelect.value]);

        } else if(weapType ==="torpedo") {
            for(let w in ship.weaponry.name) {
                if(ship.weaponry.name.includes(torpedoSelect.value)){
                    return;
                }
            }
            addWeapon(torpedoSelect.value, ship.scale + ship.departments[1] + weapDamage[torpedoSelect.value], weapQual[torpedoSelect.value]);
        }
    }
}

function talentHandler() {
    console.log("talentHandler fired");
    if(!ship.talents.includes(talentField.value)){
        addTalent(talentField.value);
        console.log(ship.talents);
    }
}

function traitHandler() {
    console.log("traitHandler fired");
    if(traitField.value != "" && !ship.traits.includes(traitField.value)){
        addTrait(traitField.value);
        traitField.value = "";
    }
    console.log(ship.traits);
}

function addTalent(talent) {
    console.log("addTalent fired");
    console.log(talent);
    if(!ship.talents.includes(talent)){
        ship.talents.push(talent);
    }
    let newTalentEntry = document.createElement("option");
    newTalentEntry.text = `${talent}`;
    talentDisplay.add(newTalentEntry);
    console.log(ship.talents);
}

function addTrait(trait) {
    console.log("addTrait fired");
    console.log(trait);
    if(!ship.traits.includes(trait)){
        ship.traits.push(trait);
    }
    let newTraitEntry = document.createElement("option");
    newTraitEntry.text = `${trait}`;
    console.log("NTE" + trait)
    traitDisplay.add(newTraitEntry);
    console.log(ship.traits);
}

function addWeapon(name,damage,qualities) {
    console.log("addWeapon fired");
    if(!ship.weaponry.name.includes(name)){
        ship.weaponry.name.push(name);
        ship.weaponry.damage.push(damage);
        ship.weaponry.qualities.push(qualities);
    }

    console.log(ship.weaponry.name);
    console.log(ship.weaponry.damage);
    console.log(ship.weaponry.qualities);
    let newWeapEntry = document.createElement("option");
    newWeapEntry.text = `${name}\t\t${damage}\u25B5\t\t${qualities}`;
    weaponDisplay.add(newWeapEntry);
}

function removeWeapon() {
    console.log("removeWeapon fired");
    let index = weaponDisplay.selectedIndex;
    if(index > -1) {
        ship.weaponry.name.splice(index,1);
        ship.weaponry.damage.splice(index,1);
        ship.weaponry.qualities.splice(index,1);
        weaponDisplay.remove(index);
    }
}
function removeTrait() {
    console.log("removeTrait fired");
    let index = traitDisplay.selectedIndex;
    if(index > -1) {
        ship.traits.splice(index,1);
        traitDisplay.remove(index);
    }
}
function removeTalent() {
    console.log("removeTalent fired");
    let index = talentDisplay.selectedIndex;
    if(index > -1) {
        ship.talents.splice(index,1);
        talentDisplay.remove(index);
    }
}

function missionProfileHandler() {
    console.log("missionProfileHandler fired");
    missionProfileSelectTd.hidden = true;
    ship.missionProfile = missionProfile.value;
    missionProfileTextTd.textContent = ship.missionProfile;
    missionProfileTextTd.hidden = false;
    missionProfileButtonTd.hidden = true;
    profileTalentTr.hidden = false;

    for(let i = 0; i < ship.departments.length; i++){
        ship.departments[i] += profiles[missionProfile.value][i];
    }

    profileTalentSelect.innerHTML = profilesChoices[missionProfile.value];

    updateStats();
}

function profileTalentHandler() {
    console.log("profileTalentHandler fired");
    
    if(!ship.talents.includes(profileTalentSelect.value)){
        profileTalentTr.hidden = true;
        addTalent(profileTalentSelect.value);
        updateStats();
    }
}

function updateStats() {
    console.log("updateStats fired");

        commsTd.textContent = String(ship.systems[0]);
        enginesTd.textContent = String(ship.systems[1]);
        structureTd.textContent = String(ship.systems[2]);
        computersTd.textContent = String(ship.systems[3]);
        sensorsTd.textContent = String(ship.systems[4]);
        weaponsTd.textContent = String(ship.systems[5]);
        commandTd.textContent = String(ship.departments[0]);
        securityTd.textContent = String(ship.departments[1]);
        scienceTd.textContent = String(ship.departments[2]);
        connTd.textContent = String(ship.departments[3]);
        engineeringTd.textContent = String(ship.departments[4]);
        medicineTd.textContent = String(ship.departments[5]);
        //traitDisplay.value = ship.traits;
        //talentDisplay.value = ship.talents;
        talentDisplay.innerHTML = "";
        traitDisplay.innerHTML = "";
        weaponDisplay.innerHTML = "";
        
        for(let tal in ship.talents) {
            addTalent(ship.talents[tal]);
            console.log("Updating: " + ship.talents[tal]);
        }
        
        for(let tr in ship.traits) {
            addTrait(ship.traits[tr]);
            console.log("Updating: " + ship.traits[tr])
        }

        for(let w in ship.weaponry.name) {
            addWeapon(ship.weaponry.name[w], ship.weaponry.damage[w], ship.weaponry.qualities[w]);
            console.log(ship.weaponry.name[w]+" "+ ship.weaponry.damage[w]+" "+ ship.weaponry.qualities[w])
        }

}

function twelveExists() {
    console.log("twelveExists fired");
    for(let i = 0; i < ship.systems.length; i++){
        if(ship.systems[i] >= 12){
            updateStats();
            return true;
        }
    }
    return false;
}

function calcRefits() {
    return (starDate - inserviceDate)/10;
}

loadButton.addEventListener("click", loadHandler);
newButton.addEventListener("click", newHandler);
downloadButton.addEventListener("click", downloadHandler);
cancelButton.addEventListener("click", cancelHandler);
importButton.addEventListener("click", importHandler);
editButton.addEventListener("click", editHandler);

//add event listeners to Systems section
commsUpButton.addEventListener("click", systIncrease("commsTd", 0));
commsDownButton.addEventListener("click", systDecrease("commsTd", 0));
engineUpButton.addEventListener("click", systIncrease("enginesTd", 1));
engineDownButton.addEventListener("click", systDecrease("enginesTd", 1));
strucUpButton.addEventListener("click", systIncrease("structureTd", 2));
strucDownButton.addEventListener("click", systDecrease("structureTd", 2));
compUpButton.addEventListener("click", systIncrease("computersTd", 3));
compDownButton.addEventListener("click", systDecrease("computersTd", 3));
sensUpButton.addEventListener("click", systIncrease("sensorsTd", 4));
sensDownButton.addEventListener("click", systDecrease("sensorsTd", 4));
weapUpButton.addEventListener("click", systIncrease("weaponsTd", 5));
weapDownButton.addEventListener("click", systDecrease("weaponsTd", 5));

//add event listeners to Departments section
cmdUpButton.addEventListener("click", deptIncrease("commandTd", 0));
cmdDownButton.addEventListener("click", deptDecrease("commandTd", 0));
secUpButton.addEventListener("click", deptIncrease("securityTd", 1));
secDownButton.addEventListener("click", deptDecrease("securityTd", 1));
sciUpButton.addEventListener("click", deptIncrease("scienceTd", 2));
sciDownButton.addEventListener("click", deptDecrease("scienceTd", 2));
connUpButton.addEventListener("click", deptIncrease("connTd", 3));
connDownButton.addEventListener("click", deptDecrease("connTd", 3));
engUpButton.addEventListener("click", deptIncrease("engineeringTd", 4));
engDownButton.addEventListener("click", deptDecrease("engineeringTd", 4));
medUpButton.addEventListener("click", deptIncrease("medicineTd", 5));
medDownButton.addEventListener("click", deptDecrease("medicineTd", 5));

setClassButton.addEventListener("click", setClassHandler);
setNameButton.addEventListener("click", setNameHandler);
cancelNewButton.addEventListener("click", cancelHandler);

talentButton.addEventListener("click", talentHandler);
traitButton.addEventListener("click", traitHandler);
weaponButton.addEventListener("click", weaponHandler("weapon"));
torpedoButton.addEventListener("click", weaponHandler("torpedo"));
removeWeaponButton.addEventListener("click", removeWeapon);
removeTraitButton.addEventListener("click", removeTrait);
removeTalentButton.addEventListener("click", removeTalent);
missionProfileButton.addEventListener("click", missionProfileHandler);
profileTalentButton.addEventListener("click", profileTalentHandler);
console.log("EventListeners loaded");

let talentFill = "";
for(i in talentChoices){
    talentFill += `<option>${talentChoices[i]}</option>\n`;
}
talentField.innerHTML = talentFill;

