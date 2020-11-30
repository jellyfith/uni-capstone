var plan = {};
var events = [];
var activities = [];

init();

function init() {
	let searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('plan') != null) {
		loadPlan(searchParams.get('plan'));
	} else {
		createNewPlan();
	}
}

function loadPlan(plan_id) {
	$.get('/api/getPlan', {plan_id: plan_id} ).done(p => {
		plan = p;
		events = [];
		activities = [];
		console.log('plan :>> ', plan);

		$('#plan-title').text(plan.plan_name);
		let $eventContainer = $('#event-container');
		plan.events.forEach(event => {
			events.push(event);
			let $eventHTML = $($.parseHTML(eventHTML(event)));
			// let $eventHeader = $eventHTML.find('.card-header');
			let $eventBody = $eventHTML.find('.card-body');
			let $eventNotes = $($.parseHTML(notesHTML(event.notes)));
			$eventBody.append($eventNotes);
			event.activities.forEach(activity => {
				activities.push(activity);
				let $activityHTML = $($.parseHTML(activityHTML(activity)));
				$eventBody.append($activityHTML);
			});
			$eventBody.append($($.parseHTML(eventButtonContainerHTML(event))));
			$eventContainer.append($eventHTML);
		});
	});
}
function createNewPlan() {

}
function addActivity(event_id) {

}
function addNotes() {

}
function saveEvent(event_id) {
	let $eventNameInput = document.querySelector(`#event-${event_id} .event-name-input`);
	let $eventNameDisplay = document.querySelector(`#event-${event_id} .event-name`);
	let $eventButtonContainer = document.querySelector(`#event-${event_id} .button-container`);
	let $eventEditButton = document.querySelector(`#event-${event_id} .edit-event-button`);
	if ($eventNameInput == null || $eventNameDisplay == null || $eventButtonContainer == null || $eventEditButton == null) return;
	$eventNameInput.hidden = false;
	$eventNameDisplay.hidden = true;
	$eventButtonContainer.hidden = false;
	$eventEditButton.hidden = true;
}
function addNewEvent() {

}
function editEvent(event_id) {
	let event = events.find(x => x.event_id === event_id);
	if (event == null) return;
	let $eventNameInput = document.querySelector(`#event-${event_id} .event-name-input`);
	let $eventNameDisplay = document.querySelector(`#event-${event_id} .event-name`);
	let $eventButtonContainer = document.querySelector(`#event-${event_id} .button-container`);
	let $eventEditButton = document.querySelector(`#event-${event_id} .edit-event-button`);
	let $eventNotesInput = document.querySelector(`#event-${event_id} .notes-input`);
	let $eventNotesDisplay = document.querySelector(`#event-${event_id} .notes-display`);

	$eventNameInput.value = event.event_title;
	$eventNotesInput.value = event.notes;
	
	$eventNameInput.hidden = false;
	$eventNameDisplay.hidden = true;
	$eventButtonContainer.hidden = false;
	$eventEditButton.hidden = true;
	$eventNotesInput.hidden = false;
	$eventNotesDisplay.hidden = true;
}
function editActivity(activity_id) {
	console.log('activity_id :>> ', activity_id);
}

function eventHTML(event) {
	if (event == null) return "";
	return `
		<div class="card base-event" id="event-${event.event_id}">
			<div class="card-header">
				<input type="text" class="form-control event-name-input" placeholder="Event Name" hidden>
				<span class="event-name">${event.event_title}</span>
				<span class="edit-event-button" onclick="editEvent(${event.event_id})"><i class="fas fa-edit"></i></span>
			</div>
			<div class="card-body">
			</div>
		</div>
	`;
}
function eventButtonContainerHTML(event) {
	return `
		<div class="button-container" hidden>
			<button class="btn btn-secondary mr-2" onclick="addActivity(${event.event_id})" disabled>Add Activity</button>
			<button class="btn btn-green" style="position: absolute; right: 1.25rem;" onclick="saveEvent(${event.event_id})" disabled>Save</button>
		</div>
	`;
}

function eventTitleHTML(event) {
	if (event == null) return "";
	return `
		<input type="text" class="form-control activity-input-${event.event_id}" placeholder="Activity" hidden>
		<span class="activity-display-${event.event_id}">${plan.event_title}</span>
	`;
}
function activityHTML(activity) {
	if (activity == null) return "";
	return `
        <div class="card" id="activity-${activity.activity_id}">
            <div class="card-header">
                <input type="text" class="form-control activity-name-input" placeholder="Activity Name" hidden>
                <span class="activity-content">${activity.activity_content}</span>
                <span class="edit-activity-button" style="color:#6c757d; cursor:unset;" onclick="editActivity(${activity.activity_id})" disabled><i class="fas fa-edit"></i></span>
            </div>
			<div class="card-body">
				<textarea class="form-control notes-input" rows="3" placeholder="Notes" hidden></textarea>
				<span class="notes-display">${activity.notes}</span>
            </div>
        </div>
	`;
}
function notesHTML(notes) {
	if (notes == null) return "";
	return `
		<textarea class="form-control notes-input" rows="3" placeholder="Notes" hidden></textarea>
		<div class="notes-display">${notes}</div>
	`;
}