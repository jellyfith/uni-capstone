'use-strict'
var plan = {};
var events = [];
var activities = [];

init();

function init() {
	let searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('plan') != null) {
		loadPlan(searchParams.get('plan'));
	$(".edit-button").prop("hidden", false);
	}
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
		$('.close-event').prop('hidden', true);
		$('.close-activity').prop('hidden', true);
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
	$('.close-event').prop('hidden', false);
	$('.close-activity').prop('hidden', false);
}
function savePlan() {
	let getID = function(z) {
		let id = $(z).attr("id");
		id = id.replace("event-", "");
		id = id.replace("activity-", "");
		if (id.length == 0 || isNaN(parseInt(id))) return null;
		return parseInt(id);
	}
	console.dir($("#plan-title-input").val())
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
		data: JSON.stringify(p)
	}).done(data => {
		plan = data;
		events = [];
		activities = [];
		console.log('plan :>> ', plan);

		$('#plan-title-display').text(plan.plan_name);
		$('#plan-title-display').prop("hidden", false);
		$('#plan-title-input').prop("hidden", true);
		let $eventContainer = $('#event-container');
		$(".base-event").each(function() {$(this).remove();});
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
		$(".save-button").prop("hidden", true);
		$(".cancel-button").prop("hidden", true);
		$(".edit-button").prop("hidden", false);
		$('.close-event').prop('hidden', true);
		$('.close-activity').prop('hidden', true);
		$("#plan-url").val(`https://vacation-planning-app.herokuapp.com/?plan=${plan.plan_id}`);
		$("#plan-modal").modal("show");
		$("#plan-url").select();
		try {
			document.execCommand('copy');
			$("#copied-msg").text("Copied to clipboard!");
			if (history.pushState)
				history.pushState({}, 'Vacation Planner - Plan - ' + plan.plan_name, `/?plan=${plan.plan_id}`);
			setTimeout(() => {
				$("#copied-msg").text("");
			}, 5000);
		} catch (error) {
			console.error(error)
		}
	});
}
function cancelEdit() {
	$('#plan-title-display').text(plan.plan_name);
	$('#plan-title-display').prop("hidden", false);
	$('#plan-title-input').prop("hidden", true);
	let $eventContainer = $('#event-container');
	$(".base-event").each(function() {$(this).remove();});
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
	$(".save-button").prop("hidden", true);
	$(".cancel-button").prop("hidden", true);
}

function addNewEvent() {
	let $eventContainer = $('#event-container');
	let $event = $($.parseHTML(eventHTML()));
	$eventContainer.append($event);
	$(".edit-button").prop("hidden", false);
	editPlan();
	if ($("#plan-title-input").val() === "") return $("#plan-title-input").focus();
	$event.find('.name-input').focus();
}

function addActivity(event_id) {
	let $eventContainer = $('.event-button-container');
	let $activity = $($.parseHTML(activityHTML()));
	$activity.find('.name-input').prop('hidden', false);
	$activity.find('.name-display').prop('hidden', true);
	$activity.find('.notes-input').prop('hidden', false);
	$activity.find('.notes-display').prop('hidden', true);
	$activity.find('.close-event').prop('hidden', false);
	$activity.find('.close-activity').prop('hidden', false);
	$eventContainer.before($activity);
	$activity.find('.name-input').focus();
}

function eventHTML(event = {}) {
	return `
		<div class="card base-event" id="event-${event.event_id || ""}">
			<div class="card-header">
				<input type="text" class="form-control event name-input" placeholder="Event Name" hidden>
				<span class="event name-display">${event.event_title || ""}</span>
				<button type="button" class="close close-event" aria-label="Close"
					onclick="$(this).closest('.base-event').remove()"
				>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="card-body">
				<textarea class="form-control event notes-input" rows="3" placeholder="Notes" hidden></textarea>
				<div class="event notes-display">${event.notes || ""}</div>
				<div class="event-button-container" hidden>
					<button class="btn btn-secondary mr-2" onclick="addActivity(${event.event_id || ""})">Add Activity</button>
				</div>
			</div>
		</div>
	`;
}
function activityHTML(activity = {}) {
	return `
        <div class="card base-activity" id="activity-${activity.activity_id || ""}">
            <div class="card-header">
                <input type="text" class="form-control activity name-input" placeholder="Activity Name" hidden>
                <span class="activity name-display">${activity.activity_content || ""}</span>
				<button type="button" class="close close-activity" aria-label="Close"
					onclick="$(this).closest('.base-activity').remove()"
				>
					<span aria-hidden="true">&times;</span>
				</button>
            </div>
			<div class="card-body">
				<textarea class="form-control activity notes-input" rows="3" placeholder="Notes" hidden></textarea>
				<div class="activity notes-display">${activity.notes || ""}</div>
            </div>
        </div>
	`;
}