/**
 * Created by johannes on 09.06.16.
 */

jQuery.fn.addHidden = function (name, value) {
    return this.each(function () {
        var input = $("<input>").attr("type", "hidden").attr("name", name).val(value);
        $(this).append($(input));
    });
};

$(document).ready(function(){

    // reset url in case of linked service callback
    window.history.pushState("projectr", "projectr", $('#template-url').val());

    // render materialize select
    $("form select").material_select();

    // enable drag & drop
    $(".skill-panel").sortable({
        connectWith: ".skill-panel"
    }).disableSelection();

    // css modifications for "add info later"
    $('#check-later').change(function() {
        if ($(this).is(":checked")) {
            $("#skip-btn").removeAttr("disabled").removeClass("grey").addClass("amber darken-1");

            $("#skill-add-btn").hide();

            $("#form-section").find("input, textarea, button").attr("disabled","disabled");
            $("#form-section .card-panel button").removeClass("teal").addClass("grey");

            $("#submit-btn").removeClass("amber darken-1").addClass("grey");
        } else {
            $("#skip-btn").attr("disabled","disabled").removeClass("amber darken-1").addClass("grey");

            $("#skill-add-btn").show();

            $("#form-section").find("input, textarea, button").removeAttr("disabled");
            $("#form-section .card-panel button").removeClass("grey").addClass("teal");

            $("#submit-btn").removeClass("grey").addClass("amber darken-1");
        }
    });

    /* skills input */
    var skillLevel = $("#level");
    var skillText = $("#skills-text");

    // chosen element from the skills list
    var chosen = undefined;

    /* listener for add skill */
    $("#skill-add-btn").click(function(){

        if(skillText.val() !== undefined && skillText.val() !== "") {
            /* skill lookup */
            $.ajax({
                url: "/skills/" + skillText.val().trim(),
                dataType: "json",
                success: function(data){

                    /* invalid input */
                    if(data === undefined || data === [] || data.length == 0){
                        /* load skills */
                        $.ajax({url: "/skills", dataType: "json", success: function(data){
                            /* fill parent list select */
                            data.forEach(function(s){
                                $("#parent-skill").append(
                                    $("<option class='parent-skill-opt' value='" + s.id + "'>" + s.name + "</option>"));
                            });

                            // enable materialize select with async loaded skills
                            $('#parent-skill').material_select();
                        }
                        });

                        /* render the modal */
                        $("#new-skill-field").text(skillText.val());
                        $("#new-skill-modal").openModal({dismissible: false});

                        /* exactly 1 match found */
                    } else if(data.length == 1){
                        var skill = data[0];

                        if(skill.name == skillText.val().trim()) {
                            /* create new chip for found skill and add it to the skill section */
                            addSkill(skill);

                            // reset input
                            skillText.val("");
                        } else{
                            /* create new skill - load skills */
                            $.ajax({url: "/skills", dataType: "json", success: function(data){
                                /* fill parent list select */
                                data.forEach(function(s){
                                    $("#parent-skill").append(
                                        $("<option class='parent-skill-opt' value='" + s.id + "'>" + s.name + "</option>"));
                                });

                                // enable materialize select with async loaded skills
                                $('#parent-skill').material_select();
                            }
                            });

                            /* render the modal */
                            $("#new-skill-field").text(skillText.val());
                            $("#new-skill-modal").openModal({dismissible: false});
                        }

                        /* multiple matches found */
                    } else{
                        /* fill modal list with possible matches for the entered skill */
                        data.forEach(function(s){
                            $("#skills-modal .collection").append(
                                $("<a id='sugg-skill-" + s.id + "' name='" + s.id + "'>" + s.name + "</a>")
                                    .addClass("collection-item cursor-pointer"));
                        });

                        /* chosen skill from the list */
                        chosen = $("#skills-modal .collection-item").first();
                        chosen.addClass("active");

                        // skill collection chooser
                        $("#skills-modal .collection-item").click(function(){
                            chosen.removeClass("active");
                            $(this).addClass("active");
                            chosen = $(this);
                        });

                        /* render the modal */
                        $("#skills-modal").openModal({dismissible: false});
                    }
                }
            });
            // empty input
        } else{
            Materialize.toast($("#txt-skill-missing").val() + "!", 3000, "rounded red darken-3");
        }
    });

    /* skill chosen from list */
    $("#skills-modal-ok-btn").click(function(){
        /* create new chip for chosen skill and add it to the skill section */
        var skill = {id: chosen[0].name, name: chosen[0].text};

        addSkill(skill);

        // reset input
        skillText.val("");

        $("#skills-modal .collection-item").remove();
        $("#skills-modal").closeModal();
    });

    /* modal closed (canceled) */
    $("#skills-modal-close-btn").click(function(){
        $("#skills-modal .collection-item").remove();
        $("#skills-modal").closeModal();
    });

    /* save new skill */
    $("#new-skill-modal-ok-btn").click(function(){

        var parentSkill = $("#parent-skill").val();

        // save skill
        $.ajax({
            url: "/skills/add",
            method: "POST",
            dataType: "json",
            data: {
                "skill_name": skillText.val(),
                "parent_id": parentSkill
            },
            success: function (skill) {
                $(".parent-skill-opt").remove();
                $("#new-skill-modal").closeModal();

                addSkill(skill);

                // reset input
                skillText.val("");

                Materialize.toast($("#txt-skill-added").val() + "!", 3000, "rounded projectr-pink-bg");
            }
        });
    });

    /* new modal closed (canceled) */
    $("#new-skill-modal-close-btn").click(function(){
        $(".parent-skill-opt").remove();
        $("#new-skill-modal").closeModal();
    });

    /* prevent form submit on enter */
    $('#submit-form').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });

    /* import from GitHub *
    $("#import-github-btn").click(function(){

        $.ajax({
            url: "/github/auth/github",
            method: "GET",
            dataType: "json",
            success: function (data) {
                console.log(data);
            }
        });

    });*/

    /* add the skills in the different sections to the form before submitting */
    var submit_form = $("#submit-form");
    submit_form.submit(function(){

        $("#skill-section-4 .skill-panel .chip").each(function(index, skill){
            submit_form.addHidden("level_4", skill.id.split("skill-")[1]);
        });

        $("#skill-section-3 .skill-panel .chip").each(function(index, skill){
            submit_form.addHidden("level_3", skill.id.split("skill-")[1]);
        });

        $("#skill-section-2 .skill-panel .chip").each(function(index, skill){
            submit_form.addHidden("level_2", skill.id.split("skill-")[1]);
        });

        $("#skill-section-1 .skill-panel .chip").each(function(index, skill){
            submit_form.addHidden("level_1", skill.id.split("skill-")[1]);
        });

        return true;
    });

    /* adds the given skill to the according section */
    var addSkill = function(skill) {

        if (skillExists(skill.id)) {
            Materialize.toast($("#txt-dup-skill").val() + "!", 3000, "rounded projectr-pink-bg");

        } else {
            var skillChip = $("<div id='skill-" + skill.id + "'>" + skill.name +
                "<i class=\"material-icons white-text\">close</i></div>")
                .addClass("chip projectr-pink-bg white-text cursor-pointer");

            $(".skill-panel").sortable({
                connectWith: ".skill-panel"
            }).disableSelection();

            $("#skill-section-" + skillLevel.val() + " .skill-panel").append(skillChip);
        }
    };

    /* checks if the given skill id is already used */
    var skillExists = function (skill_id) {
        var bool = false;

        $(".skill-panel .chip").each(function(index, s){
            if(s.id.split("skill-")[1] == skill_id){
                bool = true;
            }
        });

        return bool;
    };
});