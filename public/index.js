'use-strict'
var plan = {};
var events = [];
var activities = [];

init();

function init() {
	let searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('plan') != null) {
		loadPlan(searchParams.get('plan'));
		enableEdit();
	// } else {
	// 	createNewPlan();
	}
}
function enableEdit() {
	$(".edit-button").prop("hidden", false);
}
function loadPlan(plan_id) {
	$.get('/api/getPlan', {plan_id: plan_id} ).done(p => {
		plan = p;
		events = [];
		activities = [];
		console.log('plan :>> ', plan);

		$('#plan-title-display').text(plan.plan_name);
		let $eventContainer = $('#event-container');
		plan.events.forEach(event => {
			events.push(event);
			let $eventHTML = $($.parseHTML(eventHTML(event)));
			let $eventBody = $eventHTML.find('.card-body');
			event.activities.forEach(activity => {
				activities.push(activity);
				let $activityHTML = $($.parseHTML(activityHTML(activity)));
				$eventBody.find(".event-button-container").before($activityHTML);
			});
			$eventContainer.append($eventHTML);
		});
		$(".edit-button").prop("hidden", false);
	});
}
function editPlan() {
	$("#plan-title-input").val($("#plan-title-display").text());
	$(".base-event").each((i, e) => {
		$(e).children().find(".name-input").val($(e).children().find(".name-display").text());
		$(e).children().find(".notes-input").val($(e).children().find(".notes-display").text());
		$(e).find(".base-activity").each((i, a) => {
			$(a).children().find(".name-input").val($(a).children().find(".name-display").text());
			$(a).children().find(".notes-input").val($(a).children().find(".notes-display").text());
		});
	});
	
	$("#plan-title-display").prop("hidden", true);
	$("#plan-title-input").prop("hidden", false);
	$(`.name-input`).prop("hidden", false);
	$(`.name-display`).prop("hidden", true);
	$(`.notes-input`).prop("hidden", false);
	$(`.notes-display`).prop("hidden", true);
	$(".event-button-container").prop("hidden", false);
	$(".save-button").prop("hidden", false);
	$(".cancel-button").prop("hidden", false);
	$(".edit-button").prop("hidden", true);
}
function savePlan() {
	let getID = function($z) {
		let id = $($z).attr("id");
		id = id.replace("event-", "");
		id = id.replace("activity-", "");
		if (id.length == 0 || isNaN(parseInt(id))) return null;
		return parseInt(id);
	}
	let p = {
		plan_id: plan.plan_id || null,
		plan_name: $("#plan-title-input").val(),
		events: []
	}
	$(`.base-event`).each((i, $e) => {
		let e = {
			event_id: getID($e),
			event_title: $($e).find(".event.name-input").val(),
			activities: [],
			notes: $($e).find(".event.notes-input").val()
		}
		console.log('e', e)
		$($e).find(`.base-activity`).each((j, $a) => {
			let a = {
				activity_id: getID($a),
				activity_content: $($a).find(".activity.name-input").val(),
				notes: $($a).find(".activity.notes-input").val()
			}
			e.activities.push(a);
		});
		p.events.push(e);
	});
	console.log('p', p)
	$.ajax({
		url: "/api/savePlan",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(plan)
	}).done(data => {
		console.log('data', data)
		plan = data;
		$("#plan-title-display").val(plan.plan_name);
		plan.events.forEach(event => {
			let $event = $(`#event-${event.event_id}`);
			$event.find(".name-display").val(event.event_title);
			$event.find(".notes-display").val(event.notes);
			event.activities.forEach(activity => {
				let $activity = $(`#activity-${activity.id}`);
				$activity.find(".name-display").val(activity.activity_content);
				$activity.find(".notes-display").val(activity.notes);
			});
		});
		$("#plan-title-display").prop("hidden", false);
		$("#plan-title-input").prop("hidden", true);
		$(`.name-input`).prop("hidden", true);
		$(`.name-display`).prop("hidden", false);
		$(`.notes-input`).prop("hidden", true);
		$(`.notes-display`).prop("hidden", false);
		$(".event-button-container").prop("hidden", true);
		$(".save-button").prop("hidden", true);
		$(".cancel-button").prop("hidden", true);
		$(".edit-button").prop("hidden", false);
	});
}
function cancelEdit() {
	$("#plan-title-display").prop("hidden", false);
	$("#plan-title-input").prop("hidden", true);
	$(`.name-input`).prop("hidden", true);
	$(`.name-display`).prop("hidden", false);
	$(`.notes-input`).prop("hidden", true);
	$(`.notes-display`).prop("hidden", false);
	$(".event-button-container").prop("hidden", true);
	$(".save-button").prop("hidden", true);
	$(".cancel-button").prop("hidden", true);
	$(".edit-button").prop("hidden", false);
	$("#plan-title-input").val("");
	$(".name-input").val("");
	$(".notes-input").val("");
}
function saveEvent(event_id) {
	let $eventNameInput = $(`#event-${event_id} .event name-input`);
	let $eventNameDisplay = $(`#event-${event_id} .event name`);
	let $eventButtonContainer = $(`#event-${event_id} .event-button-container`);
	let $eventEditButton = $(`#event-${event_id} .edit-event-button`);
	if ($eventNameInput == null || $eventNameDisplay == null || $eventButtonContainer == null || $eventEditButton == null) return;
	$eventNameInput.hidden = false;
	$eventNameDisplay.hidden = true;
	$eventButtonContainer.hidden = false;
	$eventEditButton.hidden = true;
}
function addNewEvent() {
	let $eventContainer = $('#event-container');
	$eventContainer.append($($.parseHTML(eventHTML(event))));
	$(".edit-button").prop("hidden", false);
}
function editEvent(event_id) {
	let event = events.find(x => x.event_id === event_id);
	if (event == null) return;
	let $eventNameInput = $(`#event-${event_id} .event name-input`);
	let $eventNameDisplay = $(`#event-${event_id} .event-name`);
	let $eventButtonContainer = $(`#event-${event_id} .event-button-container`);
	let $eventEditButton = $(`#event-${event_id} .edit-event-button`);
	let $eventNotesInput = $(`#event-${event_id} .notes-input`);
	let $eventNotesDisplay = $(`#event-${event_id} .notes-display`);

	$eventNameInput.val(event.event_title);
	$eventNotesInput.val(event.notes);
	
	$eventNameInput.prop("hidden", false);
	$eventNameDisplay.prop("hidden", true);
	$eventButtonContainer.prop("hidden", false);
	$eventEditButton.prop("hidden", true);
	$eventNotesInput.prop("hidden", false);
	$eventNotesDisplay.prop("hidden", true);
}
function saveEvent(event_id) {
	let event = events.find(x => x.event_id === event_id);
	if (event == null) return;
	let $eventNameInput = $(`#event-${event_id} .event name-input`);
	let $eventNameDisplay = $(`#event-${event_id} .event-name`);
	let $eventButtonContainer = $(`#event-${event_id} .event-button-container`);
	let $eventEditButton = $(`#event-${event_id} .edit-event-button`);
	let $eventNotesInput = $(`#event-${event_id} .notes-input`);
	let $eventNotesDisplay = $(`#event-${event_id} .notes-display`);

	$eventNameInput.val(event.event_title);
	$eventNotesInput.val(event.notes);
	
	$eventNameInput.prop("hidden", true);
	$eventNameDisplay.prop("hidden", false);
	$eventButtonContainer.prop("hidden", true);
	$eventEditButton.prop("hidden", false);
	$eventNotesInput.prop("hidden", true);
	$eventNotesDisplay.prop("hidden", false);
}
function deleteEvent(event_id) {
	
}



function addActivity(event_id) {

}
function editActivity(activity_id) {
	let activity = activities.find(x => x.activity_id === activity_id);
	if (activity == null) return;
	let $activityNameInput = $(`#activity-${activity_id} .activity name-input`);
	let $activityNameDisplay = $(`#activity-${activity_id} .activity content`);
	let $activityEditButton = $(`#activity-${activity_id} .edit-activity-button`);
	let $activityNotesInput = $(`#activity-${activity_id} .notes-input`);
	let $activityNotesDisplay = $(`#activity-${activity_id} .notes-display`);

	$activityNameInput.val(activity.activity_content);
	$activityNotesInput.val(activity.notes);
	
	$activityNameInput.prop("hidden", false);
	$activityNameDisplay.prop("hidden", true);
	$activityEditButton.prop("hidden", true);
	$activityNotesInput.prop("hidden", false);
	$activityNotesDisplay.prop("hidden", true);
}
function saveActivity(activity_id) {
	let activity = activities.find(x => x.activity_id === activity_id);
	if (activity == null) return;
	let $activityNameInput = $(`#activity-${activity_id} .activity name-input`);
	let $activityNameDisplay = $(`#activity-${activity_id} .activity content`);
	let $activityButtonContainer = $(`#activity-${activity_id} .activity-button-container`);
	let $activityEditButton = $(`#activity-${activity_id} .edit-activity-button`);
	let $activityNotesInput = $(`#activity-${activity_id} .notes-input`);
	let $activityNotesDisplay = $(`#activity-${activity_id} .notes-display`);

	$activityNameDisplay.text(activity.activity_content);
	$activityNotesDisplay.text(activity.notes);
	
	$activityNameInput.prop("hidden", true);
	$activityNameDisplay.prop("hidden", false);
	$activityButtonContainer.prop("hidden", true);
	$activityEditButton.prop("hidden", false);
	$activityNotesInput.prop("hidden", true);
	$activityNotesDisplay.prop("hidden", false);
}
function deleteActivity(activity_id) {

}

function eventHTML(event) {
	if (event == null) return "";
	return `
		<div class="card base-event" id="event-${event.event_id}">
			<div class="card-header">
				<input type="text" class="form-control event name-input" placeholder="Event Name" hidden>
				<span class="event name-display">${event.event_title || "Event Name"}</span>
			</div>
			<div class="card-body">
				<textarea class="form-control event notes-input" rows="3" placeholder="Notes" hidden></textarea>
				<div class="event notes-display">${event.notes || "Notes"}</div>
				<div class="event-button-container" hidden>
					<button class="btn btn-secondary mr-2" onclick="addActivity(${event.event_id})">Add Activity</button>
				</div>
			</div>
		</div>
	`;
}
function activityHTML(activity) {
	if (activity == null) return "";
	return `
        <div class="card base-activity" id="activity-${activity.activity_id}">
            <div class="card-header">
                <input type="text" class="form-control activity name-input" placeholder="Activity Name" hidden>
                <span class="activity name-display">${activity.activity_content || "Activity Name"}</span>
            </div>
			<div class="card-body">
				<textarea class="form-control activity notes-input" rows="3" placeholder="Notes" hidden></textarea>
				<div class="activity notes-display">${activity.notes || "Notes"}</div>
            </div>
        </div>
	`;
}