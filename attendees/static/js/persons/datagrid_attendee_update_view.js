Attendees.datagridUpdate = {
  attendeeMainDxForm: null,  // will be assigned later, may not needed if use native form.submit()?
  attendeeAttrs: null,  // will be assigned later
  attendeeId: '',  // the attendee is being edited, since it maybe admin/parent editing another attendee
  attendeeAjaxUrl: null,
  attendeePhotoFileUploader: null,
  relationshipDatagrid: null,
  attendingMeetDatagrid: null,
  attendingPopupDxForm: null,  // for getting formData
  attendingPopupDxFormData: {},  // for storing formData
  // attendingPopupDxFormCharacterSelect: null,
  attendingPopup: null,  // for show/hide popup
  attendingsData: {},
  attendingDefaults: {
    // assembly: parseInt(document.querySelector('div.datagrid-attendee-update').dataset.currentAssemblyId),
    category: 'primary',
    // start: new Date().toISOString(),
    // finish: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 years from now
  },
  addressId: '', // for sending address data by AJAX
  placePopup: null, // for show/hide popup
  placePopupDxForm: null,  // for getting formData
  placePopupDxFormData: {},  // for storing formData
  placeDefaults: {
    address: {},
    display_order: 0,
    display_name: 'other',
    // content_type: parseInt(document.querySelector('div.datagrid-attendee-update').dataset.attendeeContenttypeId),
  },
  familyAttendeeDatagrid: null,
  familyAttrPopupDxForm: null,
  familyAttrPopup: null,
  familyAttrDefaults: {
    display_order: 0,
    attendees: [document.querySelector('input[name="attendee-id"]').value],
    division: 0,
    display_name: '',
  },

  init: () => {
    console.log("/static/js/persons/datagrid_attendee_update_view.js");
    Attendees.datagridUpdate.displayNotifiers();
    Attendees.datagridUpdate.initAttendeeForm();
  },

  initListeners: () => {
    $("div.nav-buttons").on("click", "input#custom-control-edit-checkbox", e => Attendees.datagridUpdate.toggleEditing(Attendees.utilities.toggleEditingAndReturnStatus(e)));
    $("div.form-container").on("click", "button.attending-button", e => Attendees.datagridUpdate.initAttendingPopupDxForm(e));
    $("div.form-container").on("click", "button.place-button", e => Attendees.datagridUpdate.initPlacePopupDxForm(e));
    $("div.form-container").on("click", "button.family-button", e => Attendees.datagridUpdate.initFamilyAttrPopupDxForm(e));
    Attendees.datagridUpdate.attachContactAddButton();
    // add listeners for Family, counselling, etc.
  },

  toggleEditing: (enabled) => {
    $('div.attendee-form-submits').dxButton('instance').option('disabled', !enabled);
    $('span.attendee-form-submits').dxButton('instance').option('disabled', !enabled);
    $('button.attending-button-new, button.family-button-new, button.place-button-new, input.form-check-input').prop('disabled', !enabled);
    Attendees.datagridUpdate.attendeeMainDxForm.option("readOnly", !enabled);
    Attendees.datagridUpdate.attendeePhotoFileUploader.option("disabled", !enabled);

    if (enabled) {
      Attendees.datagridUpdate.familyAttendeeDatagrid.clearGrouping();
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.infos.names.original", "visible", false);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.first_name", "visible", true);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.last_name", "visible", true);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.last_name2", "visible", true);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.first_name2", "visible", true);

      Attendees.datagridUpdate.relationshipDatagrid && Attendees.datagridUpdate.relationshipDatagrid.clearGrouping();
    } else {
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.first_name", "visible", false);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.last_name", "visible", false);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.last_name2", "visible", false);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.first_name2", "visible", false);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("attendee.infos.names.original", "visible", true);
      Attendees.datagridUpdate.familyAttendeeDatagrid.columnOption("family.id", "groupIndex", 0);

      Attendees.datagridUpdate.relationshipDatagrid && Attendees.datagridUpdate.relationshipDatagrid.columnOption("in_family", "groupIndex", 0);
    }

    const cellEditingArgs = {
      mode: 'cell',
      allowUpdating: enabled,
      allowAdding: enabled,
      allowDeleting: false,
    };
    Attendees.datagridUpdate.familyAttendeeDatagrid.option("editing", cellEditingArgs);
    Attendees.datagridUpdate.relationshipDatagrid && Attendees.datagridUpdate.relationshipDatagrid.option("editing", cellEditingArgs);
    Attendees.datagridUpdate.educationDatagrid && Attendees.datagridUpdate.educationDatagrid.option("editing", cellEditingArgs);
    Attendees.datagridUpdate.statusDatagrid && Attendees.datagridUpdate.statusDatagrid.option("editing", cellEditingArgs);
    Attendees.datagridUpdate.noteDatagrid && Attendees.datagridUpdate.noteDatagrid.option("editing", {...cellEditingArgs, ...Attendees.datagridUpdate.noteEditingArgs});
    Attendees.datagridUpdate.attendingMeetDatagrid && Attendees.datagridUpdate.attendingMeetDatagrid.option("editing", {...cellEditingArgs, ...Attendees.datagridUpdate.attendingMeetEditingArgs});
  },

  displayNotifiers: () => {
    const params = new URLSearchParams(location.search);
    if (params.has('success')) {
      DevExpress.ui.notify(
        {
          message: params.get('success'),
          width: 500,
          position: {
            my: 'center',
            at: 'center',
            of: window,
          }
        }, "success", 2500);
      params.delete('success');
      history.replaceState(null, '', '?' + params + location.hash);
    }
  },


  ///////////////////////  Main Attendee DxForm and Submit ///////////////////////


  initAttendeeForm: () => {
    Attendees.datagridUpdate.attendeeAttrs = document.querySelector('div.datagrid-attendee-update');
    Attendees.datagridUpdate.attendeeUrn = Attendees.datagridUpdate.attendeeAttrs.attendeeUrn;
    Attendees.datagridUpdate.attendeeId = document.querySelector('input[name="attendee-id"]').value;
    // Attendees.datagridUpdate.placeDefaults.object_id = Attendees.datagridUpdate.attendeeId;
    Attendees.datagridUpdate.attendeeAjaxUrl = Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeEndpoint + Attendees.datagridUpdate.attendeeId + '/';
    $.ajaxSetup({
      headers: {
        "X-CSRFToken": document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        "X-Target-Attendee-Id": Attendees.datagridUpdate.attendeeId,
      }
    });
    $.ajax({
      url: Attendees.datagridUpdate.attendeeAjaxUrl,
      success: (response) => {
        Attendees.datagridUpdate.attendeeFormConfigs = Attendees.datagridUpdate.getAttendeeFormConfigs();
        Attendees.datagridUpdate.attendeeFormConfigs.formData = response ? response : {
          infos: {
            names: {},
            contacts: {}
          }
        };
        $('h3.page-title').text('Details of ' + Attendees.datagridUpdate.attendeeFormConfigs.formData.infos.names.original);
        window.top.document.title = Attendees.datagridUpdate.attendeeFormConfigs.formData.infos.names.original;
        Attendees.datagridUpdate.attendeeMainDxForm = $("div.datagrid-attendee-update").dxForm(Attendees.datagridUpdate.attendeeFormConfigs).dxForm("instance");
        Attendees.datagridUpdate.populateBasicInfoBlock();
        Attendees.datagridUpdate.initListeners();
        Attendees.datagridUpdate.familyAttrDefaults.division = response.division;
        Attendees.datagridUpdate.familyAttrDefaults.display_name = response.infos.names.original + ' family';
      },
      error: (response) => {
        console.log('Failed to fetch data in Attendees.datagridUpdate.initAttendeeForm(), error: ', response);
      },
    });

  },

  attachContactAddButton: () => {
    $('<span>', {class: 'extra-contacts float-right'})
      .dxButton({
        disabled: !Attendees.utilities.editingEnabled,
        elementAttr: {
          class: 'attendee-form-submits',  // for toggling editing mode
        },
        text: 'Add more contact',
        icon: 'email',  // or 'fas fa-comment-dots'
        stylingMode: 'outlined',
        type: "success",
        height: '1.4rem',
        hint: 'add more different contacts such as more phones/emails',
        onClick: () => {
          Attendees.datagridUpdate.contactPopup = $('div.popup-more-contacts').dxPopup(Attendees.datagridUpdate.contactPopupDxFormConfig).dxPopup('instance');
        },
      }).appendTo($('span.dx-form-group-caption')[1]);  // basic info block is at index 1
  },

  getAttendeeFormConfigs: () => {  // this is the place to control blocks of AttendeeForm
    const originalItems = [
      {
        colSpan: 4,
        itemType: "group",
        cssClass: 'h6',
        caption: "Photo",
        items: [

          {
            dataField: 'photo',
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => {
              if (data.editorOptions && data.editorOptions.value) {
                const $img = $('<img>', {src: data.editorOptions.value, class: 'attendee-photo-img'});
                const $imgLink = $('<a>', {href: data.editorOptions.value, target: '_blank'});
                itemElement.append($imgLink.append($img));
                // Todo: add check/uncheck photo-clear feature, store img link in data attributes when marking deleted
                const $inputDiv = $('<div>', {
                  class: 'form-check',
                  title: "If checked, it'll be deleted when you save"
                });
                const $clearInput = $('<input>', {
                  id: 'photo-clear',
                  disabled: !Attendees.utilities.editingEnabled,
                  type: 'checkbox',
                  name: 'photo-clear',
                  class: 'form-check-input',
                  onclick: "return confirm('Are you sure?')"
                });
                const $clearInputLabel = $('<label>', {
                  for: 'photo-clear',
                  text: 'delete photo',
                  class: 'form-check-label'
                });
                $inputDiv.append($clearInput);
                $inputDiv.append($clearInputLabel);
                itemElement.append($inputDiv);
              } else {
                $('<img>', {
                  src: Attendees.datagridUpdate.attendeeAttrs.dataset.emptyImageLink,
                  class: 'attendee-photo-img'
                }).appendTo(itemElement);
              }
            },
          },
          {
            template: (data, itemElement) => {
              photoFileUploader = $("<div>").attr("id", "dxfu1").dxFileUploader(
                {
                  name: 'photo',
                  disabled: !Attendees.utilities.editingEnabled,
                  selectButtonText: "Select photo",
                  //                  labelText: "hi5",
                  accept: "image/*",
                  multiple: false,
                  uploadMode: "useForm",
                  onValueChanged: (e) => {
                    if (e.value.length) {
                      $('img.attendee-photo-img')[0].src = (window.URL ? URL : webkitURL).createObjectURL(e.value[0]);
                      Attendees.datagridUpdate.attendeeFormConfigs.formData['photo'] = e.value[0];
                    }
                  },
                });
              Attendees.datagridUpdate.attendeePhotoFileUploader = photoFileUploader.dxFileUploader("instance");
              itemElement.append(photoFileUploader);
            },
          },
        ],
      },
      {
        colSpan: 20,
        colCount: 21,
        itemType: "group",
        name: "basic-info-container",
        cssClass: 'h6',
        caption: "Basic info. Fields after nick name can be removed by clearing & save.",  // adding element in caption by $("<span>", {text:"hi 5"}).appendTo($("span.dx-form-group-caption")[1])
        items: [],  // will populate later for dynamic contacts
      },
      {
        colSpan: 24,
        colCount: 24,
        caption: 'Addresses',
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            name: 'places',
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => {
              const familyContentTypeId = document.querySelector('div.datagrid-attendee-update').dataset.familyContenttypeId;
              const $placeUl = $('<ul>', {class: 'list-group'});
              const newButtonAttrs = {
                text: "Add new address+",
                disabled: !Attendees.utilities.editingEnabled,
                title: '+ Add the attendee to a new address',
                type: 'button',
                class: 'place-button-new place-button btn-outline-primary btn button btn-sm ',
              };

              const $personalNewButton = $("<button>", {
                ...newButtonAttrs,
                'data-desc': 'attendee address (' + Attendees.datagridUpdate.attendeeFormConfigs.formData.infos.names.original + ')',
                'data-content-type': parseInt(document.querySelector('div.datagrid-attendee-update').dataset.attendeeContenttypeId),
                'data-object-id': Attendees.datagridUpdate.attendeeId,
              });
              const personalPlaces = Attendees.datagridUpdate.attendeeFormConfigs.formData.places || [];
              const familyattendees = Attendees.datagridUpdate.attendeeFormConfigs.formData.familyattendee_set || [];
              let $personalLi = $('<li>', {class: 'list-group-item', text: 'Personal'}).append($personalNewButton);

              personalPlaces.forEach(place => {
                const $button = $('<button>', {
                  type: 'button',
                  'data-desc': 'attendee address (' + place.street + ')',
                  class: 'btn-outline-success place-button btn button btn-sm',
                  value: place.id,
                  text: (place.display_name ? place.display_name + ': ' : '') + (place.street || '').replace(', USA', ''),
                  'data-object-id': Attendees.datagridUpdate.attendeeId,
                });
                $personalLi = $personalLi.append($button);
              });
              let $places = $placeUl.append($personalLi);

              familyattendees.forEach(familyattendee => {
                const family = familyattendee.family;
                const $familyNewButton = $("<button>", {
                  ...newButtonAttrs,
                  'data-desc': 'family address (' + family.display_name + ')',
                  'data-content-type': familyContentTypeId,
                  'data-object-id': family.id,
                });

                let $familyLi = $('<li>', {
                  class: 'list-group-item',
                  text: family.display_name
                }).append($familyNewButton);

                familyattendee.family.places.forEach(place => {
                  const $button = $('<button>', {
                    type: 'button',
                    'data-desc': family.display_name + ' family address (' + place.street + ')',
                    class: 'btn-outline-success place-button btn button btn-sm',
                    value: place.id,
                    text: (place.display_name ? place.display_name + ': ' : '') + (place.street || '').replace(', USA', ''),
                    'data-object-id': family.id,
                  });
                  $familyLi = $familyLi.append($button);
                });
                $places = $places.append($familyLi);
              });
              itemElement.append($places);
            },
          },
        ],
      },
      {
        colSpan: 24,
        colCount: 24,
        caption: "Families: Except current attendee, double click table cells to edit if editing mode is on. Click away or hit Enter to save",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: 'familyattendee_set',
            name: 'familyAttrs',
            label: {
              text: 'families',
            },
            template: (data, itemElement) => {
              Attendees.datagridUpdate.familyButtonFactory({
                text: 'New family for attendee+',
                disabled: !Attendees.utilities.editingEnabled,
                title: '+ Add the attendee to a new family',
                type: 'button',
                class: 'family-button-new family-button btn-outline-primary btn button btn-sm ',
              }).appendTo(itemElement);
              if (data.editorOptions && data.editorOptions.value) {
                data.editorOptions.value.forEach(familyAttendee => {
                  if (familyAttendee && typeof familyAttendee === 'object') {
                    Attendees.datagridUpdate.familyButtonFactory({value: familyAttendee.family.id, text: familyAttendee.family.display_name}).appendTo(itemElement);
                  }
                });
              }
            },
          },
          {
            colSpan: 24,
            dataField: "familyattendee_set",
            name: "familyAttendeeDatagrid",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => Attendees.datagridUpdate.initFamilyAttendeeDatagrid(data, itemElement),
          }
        ],
      },
      {
        apiUrlName: 'api_attendee_relationships_view_set',
        colSpan: 24,
        colCount: 24,
        caption: "Relationships & Access: double click table cells to edit if editing mode is on. Click away or hit Enter to save",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: "relationship_set",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => Attendees.datagridUpdate.initRelationshipDatagrid(data, itemElement),
          }
        ],
      },
      {
        apiUrlName: 'api_categorized_pasts_view_set_education',
        colSpan: 24,
        colCount: 24,
        caption: "Education: double click table cells to edit if editing mode is on. Click away or hit Enter to save",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: "past_education_set",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => {
              Attendees.datagridUpdate.educationDatagrid = Attendees.datagridUpdate.initPastDatagrid(data, itemElement, {
                type: 'education',
                dataFieldAndOpts: {
                  category: {},
                  display_name: {},
                  'infos.show_secret': {},
                  'infos.comment': {},
                  when: {caption: 'Start'},
                  finish: {},
                },
              });
            },
          }
        ],
      },
      {
        apiUrlName: 'api_categorized_pasts_view_set_status',
        colSpan: 24,
        colCount: 24,
        caption: "Status: double click table cells to edit if editing mode is on. Click away or hit Enter to save",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: "past_status_set",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => {
              Attendees.datagridUpdate.statusDatagrid = Attendees.datagridUpdate.initPastDatagrid(data, itemElement, {
                type: 'status',
                dataFieldAndOpts: {
                  category: {},
                  display_name: {},
                  'infos.show_secret': {},
                  'infos.comment': {},
                  when: {},
                },
              });
            },
          }
        ],
      },
      {
        apiUrlName: 'api_categorized_pasts_view_set_note',
        colSpan: 24,
        colCount: 24,
        caption: "Other notes",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: "past_note_set",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => {
              Attendees.datagridUpdate.noteDatagrid = Attendees.datagridUpdate.initPastDatagrid(data, itemElement, {
                type: 'note',
                dataFieldAndOpts: {
                  category: {},
                  display_name: {caption: 'Title'},
                  'infos.show_secret': {},
                  'infos.comment': {},
                  when: {},
                },
              });
            },
          }
        ],
      },
      {
        colSpan: 24,
        colCount: 24,
        caption: "Usually joins: register groups by buttons, or click 'edit' to join activities",
        cssClass: 'h6',
        itemType: "group",
        items: [
          {
            colSpan: 24,
            dataField: "attendingmeets",
            cssClass: 'attendings-buttons',
            label: {
              text: 'registrant/group',
            },
            template: (data, itemElement) => {
                  const attendings = data.editorOptions && data.editorOptions.value || [];
                  Attendees.datagridUpdate.attendingsData = attendings.reduce((sum, now) => {
                    return {
                      ...sum,
                      [now.attending_id]: now,
                    };
                  }, {});
                  Attendees.datagridUpdate.populateAttendingButtons(Object.values(Attendees.datagridUpdate.attendingsData), itemElement);
            },
          },
          {
            colSpan: 24,
            dataField: "attendingmeets_set",
            label: {
              location: 'top',
              text: ' ',  // empty space required for removing label
              showColon: false,
            },
            template: (data, itemElement) => Attendees.datagridUpdate.initAttendingMeetsDatagrid(data, itemElement),
          },
        ],
      },
      { // https://supportcenter.devexpress.com/ticket/details/t681806
        itemType: "button",
        name: "mainAttendeeFormSubmit",
        horizontalAlignment: "left",
        buttonOptions: {
          elementAttr: {
            class: 'attendee-form-submits',  // for toggling editing mode
          },
          disabled: !Attendees.utilities.editingEnabled,
          text: "Save Attendee details and photo",
          icon: "save",
          hint: "save attendee data in the page",
          type: "default",
          useSubmitBehavior: false,
          onClick: (e) => {
            if (confirm("Are you sure?")) {

              const userData = new FormData($('form#attendee-update-form')[0]);
              if (!$('input[name="photo"]')[0].value) {
                userData.delete('photo')
              }
              const userInfos = Attendees.datagridUpdate.attendeeFormConfigs.formData.infos;
              userInfos['contacts'] = Attendees.utilities.trimBothKeyAndValueButKeepBasicContacts(userInfos.contacts);  // remove emptied contacts
              userData.set('infos', JSON.stringify(userInfos));
              // userData._method = userData.id ? 'PUT' : 'POST';

              $.ajax({
                url: Attendees.datagridUpdate.attendeeAjaxUrl,
                contentType: false,
                processData: false,
                dataType: 'json',
                data: userData,
                method: Attendees.datagridUpdate.attendeeId ? 'PUT' : 'POST',
                success: (response) => {  // Todo: update photo link, temporarily reload to bypass the requirement
                  console.log("success here is response: ", response);
                  const parser = new URL(window.location);
                  parser.searchParams.set('success', 'Saving attendee success');
                  window.location = parser.href;
                },
                error: (response) => {
                  console.log('Failed to save data for main AttendeeForm, error: ', response);
                  console.log('formData: ', [...userData]);
                  DevExpress.ui.notify(
                    {
                      message: "saving attendee error",
                      width: 500,
                      position: {
                        my: 'center',
                        at: 'center',
                        of: window,
                      }
                    }, "error", 5000);
                },
              });
            }
          }
        },
      },
    ];
    return {
      readOnly: !Attendees.utilities.editingEnabled,
      onContentReady: () => {
        $('div.spinner-border').hide();
        Attendees.utilities.toggleDxFormGroups();
      },
      colCount: 24,
      formData: null, // will be fetched
      items: originalItems.filter(item => {
        return item.apiUrlName ? item.apiUrlName in Attendees.utilities.userApiAllowedUrlNames : true;
      }),
    };
  },

  familyButtonFactory: (attrs) => {
    return $('<button>', {
      type: 'button',
      class: 'btn-outline-success family-button btn button btn-sm ',
      ...attrs
    });
  },

  populateAttendingButtons: (attendings, itemElement) => {
    itemElement.empty();

    $('<button>').attr({
      disabled: !Attendees.utilities.editingEnabled,
      title: '+ Add a new attending',
      type: 'button',
      class: 'attending-button-new attending-button btn-outline-primary btn button btn-sm'
    }).text('+ Register group').appendTo(itemElement);

    attendings.forEach(attending => {
      if (attending && attending.attending_id) {
        let label, title;
        if (attending.attending_label){
          const originalLabel = (attending.attending_label).match(/\(([^)]+)\)/).pop();  // get substring between parentheses
          label = originalLabel.replace(Attendees.datagridUpdate.attendeeFormConfigs.formData.infos.names.original, 'Self');
          title = label;
        } else {
          const registrant_name = attending.registrant.replace(Attendees.datagridUpdate.attendeeFormConfigs.formData.infos.names.original, 'Self');
          label = attending.registration_assembly ? registrant_name + ' ' + attending.registration_assembly : registrant_name + ' Generic';
          title = attending.registrant;
        }
        $('<button>', {
          text: label,
          type: 'button',
          title: title,
          class: 'attending-button btn button btn-sm btn-outline-success',
          value: attending.attending_id,
        }).appendTo(itemElement);
      }
    });
  },

  populateBasicInfoBlock: (allContacts = Attendees.datagridUpdate.attendeeMainDxForm.option('formData').infos.contacts) => {
    const basicInfoItems = [
      {
        colSpan: 7,
        dataField: 'first_name',
        editorOptions: {
          placeholder: 'English',
        },
      },
      {
        colSpan: 7,
        dataField: 'last_name',
        editorOptions: {
          placeholder: 'English',
        },
      },
      {
        colSpan: 7,
        dataField: 'division',
        editorType: 'dxSelectBox',
        isRequired: true,
        label: {
          text: 'Major Division',
        },
        editorOptions: {
          valueExpr: 'id',
          displayExpr: 'display_name',
          placeholder: 'Select a value...',
          dataSource: new DevExpress.data.DataSource({
            store: new DevExpress.data.CustomStore({
              key: 'id',
              loadMode: 'raw',
              load: () => {
                const d = $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.divisionsEndpoint).done((response) => {
                  d.resolve(response.data);
                });
                return d.promise();
              }
            })
          }),
        },
      },
      {
        colSpan: 7,
        dataField: 'last_name2',
      },
      {
        colSpan: 7,
        dataField: 'first_name2',
      },
      {
        colSpan: 7,
        dataField: 'gender',
        editorType: 'dxSelectBox',
        isRequired: true,
        editorOptions: {
          dataSource: Attendees.utilities.genderEnums(),
          valueExpr: 'name',
          displayExpr: 'name',
        },
        validationRules: [
          {
            type: 'required',
            message: 'gender is required'
          },
        ],
      },
      {
        colSpan: 7,
        dataField: 'actual_birthday',
        editorType: 'dxDateBox',
        label: {
          text: 'Real birthday',
        },
        editorOptions: {
          placeholder: 'click calendar',
          elementAttr: {
            title: 'month, day and year are all required',
          },
        },
      },
      {
        colSpan: 7,
        dataField: 'estimated_birthday',
        label: {
          text: 'Guess birthday',
        },
        editorType: 'dxDateBox',
        editorOptions: {
          placeholder: 'click calendar',
          elementAttr: {
            title: 'pick any day of your best guess year for the age estimation',
          },
        },
      },
      {
        colSpan: 7,
        dataField: 'deathday',
        editorType: 'dxDateBox',
        editorOptions: {
          placeholder: 'click calendar',
        },
      },
      {
        colSpan: 7,
        dataField: 'infos.contacts.phone1',
        label: {
          text: 'phone1',
        },
        // editorOptions: {mask: "+1 (X00) 000-0000",}
      },
      {
        colSpan: 7,
        dataField: 'infos.contacts.phone2',
        label: {
          text: 'phone2',
        },
        // editorOptions: {mask: "+1 (X00) 000-0000",}
      },
      {
        colSpan: 7,
        dataField: 'infos.names.nick',
        label: {
          text: 'nick name',
        },
      },
      {
        colSpan: 7,
        dataField: 'infos.contacts.email1',
        label: {
          text: 'email1',
        },
      },
      {
        colSpan: 7,
        dataField: 'infos.contacts.email2',
        label: {
          text: 'email2',
        },
      },
      {
        colSpan: 7,
        dataField: 'infos.fixed.food_pref',
        label: {
          text: 'Food pref',
        },
      },
    ];

    for (const contactKey in allContacts) {
      if (allContacts.hasOwnProperty(contactKey) && !(contactKey in Attendees.utilities.basicContacts)) {
        basicInfoItems.push({
          colSpan: 7,
          dataField: 'infos.contacts.' + contactKey,
          label: {
            text: contactKey,
          },
        });
      }
    }
    Attendees.datagridUpdate.attendeeMainDxForm.itemOption('basic-info-container', 'items', basicInfoItems);
  },

  contactPopupDxFormConfig: {
    maxWidth: '50%',
    maxHeight: '50%',
    visible: true,
    title: 'Add Contact',
    position: {
      my: 'center',
      at: 'center',
      of: window,
    },
    dragEnabled: true,
    contentTemplate: (e) => {
      const formContainer = $('<div class="contact-form">');
      Attendees.datagridUpdate.contactPopupDxForm = formContainer.dxForm({
        scrollingEnabled: true,
        showColonAfterLabel: false,
        requiredMark: '*',
        showValidationSummary: true,
        items: [
          {
            dataField: 'contactKey',
            editorOptions: {
              placeholder: 'for example: WeChat1',
            },
            helpText: 'Any contact such as email3/phone3/fax1, etc',
            label: {
              text: 'Contact method',
            },
            isRequired: true,
            validationRules: [
              {
                type: 'required',
                message: 'Contact method is required'
              },
              {
                type: 'stringLength',
                min: 2,
                message: "Contact method can't be less than 2 characters"
              },
              {
                type: 'custom',
                message: 'That contact method exists already',
                validationCallback: (e) => {
                  const currentContacts = Attendees.datagridUpdate.attendeeMainDxForm.option('formData').infos.contacts;
                  return !Object.keys(currentContacts).includes(e.value.trim());
                }
              }
            ],
          },
          {
            dataField: 'contactValue',
            editorOptions: {
              placeholder: 'for example: WeiXin',
            },
            helpText: 'Contact such as name@email.com/+15101234567 etc',
            label: {
              text: 'Contact content',
            },
            isRequired: true,
            validationRules: [
              {
                type: 'required',
                message: 'Contact content is required'
              },
              {
                type: 'stringLength',
                min: 2,
                message: "Contact content can't be less than 2 characters"
              },
            ],
          },
          {
            itemType: 'button',
            horizontalAlignment: 'left',
            buttonOptions: {
              elementAttr: {
                class: 'attendee-form-submits',    // for toggling editing mode
              },
              disabled: !Attendees.utilities.editingEnabled,
              text: 'Save Custom Contact',
              icon: 'save',
              hint: "save Custom Contact in the popup",
              type: 'default',
              useSubmitBehavior: false,
              onClick: (e) => {
                if (Attendees.datagridUpdate.contactPopupDxForm.validate().isValid) {
                  const currentInfos = Attendees.datagridUpdate.attendeeMainDxForm.option('formData').infos;
                  const newContact = Attendees.datagridUpdate.contactPopupDxForm.option('formData');
                  const trimmedNewContact = Attendees.utilities.trimBothKeyAndValueButKeepBasicContacts(newContact);
                  currentInfos.contacts = Attendees.utilities.trimBothKeyAndValueButKeepBasicContacts(currentInfos.contacts);  // remove emptied contacts
                  currentInfos.contacts[trimmedNewContact.contactKey] = trimmedNewContact.contactValue;

                  $.ajax({
                    url: Attendees.datagridUpdate.attendeeAjaxUrl,
                    data: JSON.stringify({infos: currentInfos}),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    method: 'PATCH',
                    success: (response) => {
                      Attendees.datagridUpdate.contactPopupDxForm.resetValues();
                      Attendees.datagridUpdate.populateBasicInfoBlock(response.infos.contacts);
                      Attendees.datagridUpdate.contactPopup.hide();
                      DevExpress.ui.notify(
                        {
                          message: "saving custom contact success",
                          width: 500,
                          position: {
                            my: 'center',
                            at: 'center',
                            of: window,
                          }
                        }, 'success', 2500);
                    },
                    error: (response) => {
                      console.log('Failed to save data for custom contact in Popup, response and infos data: ', response, Attendees.datagridUpdate.attendeeMainDxForm.option('formData').infos);
                      Attendees.datagridUpdate.contactPopup.hide();
                      DevExpress.ui.notify(
                        {
                          message: "saving custom contact error",
                          width: 500,
                          position: {
                            my: 'center',
                            at: 'center',
                            of: window,
                          }
                        }, 'error', 5000);
                    },
                  });
                }
              },
            },
          },
        ],
      }).dxForm("instance");
      e.append(formContainer);
    },
  },


  ///////////////////////  Attending Popup and DxForm  ///////////////////////


  initAttendingPopupDxForm: (event) => {
    const attendingButton = event.target;
    Attendees.datagridUpdate.attendingPopup = $("div.popup-attending-update").dxPopup(Attendees.datagridUpdate.attendingPopupDxFormConfig(attendingButton)).dxPopup('instance');
    Attendees.datagridUpdate.fetchAttendingFormData(attendingButton);
  },

  fetchAttendingFormData: (attendingButton) => {
    if (attendingButton.value) {
      $.ajax({
        url: $('form#attending-update-popup-form').attr('action') + attendingButton.value + '/',
        success: (response) => {
          Attendees.datagridUpdate.attendingPopupDxFormData = response;
          Attendees.datagridUpdate.attendingPopupDxForm.option('formData', response);
          // Attendees.datagridUpdate.attendingPopupDxForm.option('onFieldDataChanged', (e) => e.component.validate());
        },
        error: (response) => console.log('Failed to fetch data for AttendingForm in Popup, error: ', response),
      });
    }
  },

  attendingPopupDxFormConfig: (attendingButton) => {
    const ajaxUrl = $('form#attending-update-popup-form').attr('action') + (attendingButton.value ? attendingButton.value + '/' : '');
    return {
      visible: true,
      title: attendingButton.value ? 'Viewing attending' : 'Creating attending',
      minwidth: '20%',
      minheight: '30%',
      position: {
        my: 'center',
        at: 'center',
        of: window,
      },
      onHiding: () => {
        const $existingAttendeeSelector = $('div.attendee-lookup-search').dxLookup('instance');
        if ($existingAttendeeSelector) $existingAttendeeSelector.close();
      },
      dragEnabled: true,
      contentTemplate: (e) => {
        const formContainer = $('<div class="attendingForm">');
        Attendees.datagridUpdate.attendingPopupDxForm = formContainer.dxForm({
          readOnly: !Attendees.utilities.editingEnabled,
          formData: Attendees.datagridUpdate.attendingDefaults,
          colCount: 2,
          scrollingEnabled: true,
          showColonAfterLabel: false,
          requiredMark: '*',
          labelLocation: 'top',
          minColWidth: '20%',
          showValidationSummary: true,
          items: [
            {
              dataField: 'registration.assembly',
              editorType: 'dxSelectBox',
              validationRules: [
                {
                  type: 'async',
                  message: 'Same Group/Registrant exists, please select other assembly or close the popup to find that registration',
                  validationCallback: (params) =>  Attendees.datagridUpdate.validateRegistration(params.value),
                },
              ],
              helpText: 'Same Group/Registrant can only register once',
              label: {
                text: 'Belonging Group (Assembly)',
                showColon: true,
              },
              editorOptions: {
                valueExpr: 'id',
                displayExpr: 'division_assembly_name',
                placeholder: 'Select a value...',
                showClearButton: true,
                dataSource: new DevExpress.data.DataSource({
                  store: new DevExpress.data.CustomStore({
                    key: 'id',
                    loadMode: 'raw',
                    load: () => {
                      const d = $.Deferred();
                      $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.assembliesEndpoint).done((response) => {
                        d.resolve(response.data);
                      });
                      return d.promise();
                    },
                  })
                }),
              },
            },
            {
              dataField: 'category',
              helpText: 'help text can be changed in /static/js /persons /datagrid_attendee_update_view.js',
              isRequired: true,
            },
            {
              dataField: 'registration.registrant',
              validationRules: [
                {
                  type: 'async',
                  message: 'Same Group/Registrant exists, please select other registrant or close the popup to find that registration',
                  validationCallback: (params) =>  Attendees.datagridUpdate.validateRegistration(params.value),
                },
              ],
              helpText: 'Same Group/Registrant can only register once',
              label: {
                text: 'Registrant',
              },
              editorType: 'dxLookup',
              editorOptions: {
                showClearButton: true,
                elementAttr: {
                  class: 'attendee-lookup-search',  // calling closing by the parent
                },
                valueExpr: 'id',
                displayExpr: 'infos.names.original',
                placeholder: 'Select a value...',
                // searchExpr: ['first_name', 'last_name'],
                searchPlaceholder: 'Search attendee',
                minSearchLength: 3,  // cause values disappeared in drop down
                searchTimeout: 200,  // cause values disappeared in drop down
                dropDownOptions: {
                  showTitle: false,
                  closeOnOutsideClick: true,
                },
                dataSource: Attendees.datagridUpdate.attendeeSource,
              },
            },
            {
              itemType: 'button',
              horizontalAlignment: 'left',
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: 'Save Attending',
                icon: 'save',
                hint: 'save attending data in the popup',
                type: 'default',
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  const validationResult = clickEvent.validationGroup.validate();
                  validationResult.status === 'pending' && validationResult.complete.then((validation) => {
                    if (validation.status === 'valid' && confirm('are you sure to submit the popup attendingForm?')) {
                      const userData = Attendees.datagridUpdate.attendingPopupDxForm.option('formData');

                      $.ajax({
                        url: ajaxUrl,
                        data: JSON.stringify(userData),
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        method: userData.id ? 'PUT' : 'POST',
                        success: (response) => {
                          Attendees.datagridUpdate.attendingPopup.hide();
                          DevExpress.ui.notify(
                            {
                              message: 'saving attending success',
                              width: 500,
                              position: {
                                my: 'center',
                                at: 'center',
                                of: window,
                              }
                            }, 'success', 2500);
                          response.attending_id = response.id;
                          Attendees.datagridUpdate.attendingsData[response.id] = response;
                          Attendees.datagridUpdate.populateAttendingButtons(Object.values(Attendees.datagridUpdate.attendingsData), $('div.attendings-buttons > div.dx-field-item-content'));
                        },
                        error: (response) => {
                          console.log('Failed to save data for AttendingForm in Popup, error: ', response);
                          console.log('formData: ', userData);
                          DevExpress.ui.notify(
                            {
                              message: 'saving attending error',
                              width: 500,
                              position: {
                                my: 'center',
                                at: 'center',
                                of: window,
                              }
                            }, 'error', 5000);
                        },
                      });
                    }
                  });
                }
              },
            },
          ]
        }).dxForm('instance');
        e.append(formContainer);
      }
    };
  },

  validateRegistration: (value) => {
    const registration = Attendees.datagridUpdate.attendingPopupDxForm.option('formData') && Attendees.datagridUpdate.attendingPopupDxForm.option('formData').registration || {};
    var d = $.Deferred();
    if (!Attendees.utilities.editingEnabled) {
      d.resolve();
    }else {
      $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.registrationsEndpoint, {
        assembly: registration.assembly,
        registrant: registration.registrant,
      }).done((response) => {
        const registrations = response && response.data || [];
        if (registrations.length < 1){
          d.resolve();
        } else if(registrations.length < 2){
          registrations[0].id === registration.id ? d.resolve() : d.reject();
        }
        d.reject();
      });
    }
    return d.promise();
  },

  attendeeSource: new DevExpress.data.CustomStore({
    key: 'id',
    load: (loadOptions) => {
      // if (!Attendees.utilities.editingEnabled) return [Attendees.datagridUpdate.attendingPopupDxFormData.registration.registrant];

      const deferred = $.Deferred();
      const args = {};

      [
        'skip',
        'take',
        'sort',
        'filter',
        'searchExpr',
        'searchOperation',
        'searchValue',
        'group',
      ].forEach((i) => {
        if (i in loadOptions && Attendees.utilities.isNotEmpty(loadOptions[i]))
          args[i] = loadOptions[i];
      });

      $.ajax({
        url: Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeEndpoint,
        dataType: 'json',
        data: args,
        success: (result) => {
          const registrant = Attendees.datagridUpdate.attendingPopupDxFormData.registration && Attendees.datagridUpdate.attendingPopupDxFormData.registration.registrant || null;
          const resulting_attendees = registrant ? result.data.concat([registrant]) : result.data;
          deferred.resolve(resulting_attendees, {
            totalCount: result.totalCount,
            summary: result.summary,
            groupCount: result.groupCount
          });
        },
        error: (response) => {
          console.log('ajax error here is response: ', response);
          deferred.reject('Data Loading Error, probably time out?');
        },
        timeout: 7000,
      });

      return deferred.promise();
    },
    byKey: (key) => {
      // if (!Attendees.utilities.editingEnabled && Attendees.datagridUpdate.placePopupDxFormData) {
      //   const mainAttendee = Attendees.datagridUpdate.attendingPopupDxFormData.registration && Attendees.datagridUpdate.attendingPopupDxFormData.registration.registrant || null;
      //   return mainAttendee ? [mainAttendee] : [];
      // } else {
        const d = new $.Deferred();
        $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeEndpoint + key + '/')
          .done((result) => {
            d.resolve(result);
          });
        return d.promise();
      // }
    },
  }),


  ///////////////////////  Place (Address) Popup and DxForm  ///////////////////////


  initPlacePopupDxForm: (event) => {
    const placeButton = event.target;
    Attendees.datagridUpdate.placePopup = $('div.popup-place-update').dxPopup(Attendees.datagridUpdate.placePopupDxFormConfig(placeButton)).dxPopup('instance');
    Attendees.datagridUpdate.fetchLocateFormData(placeButton);
  },

  placePopupDxFormConfig: (placeButton) => {
    const ajaxUrl = $('form#place-update-popup-form').attr('action') + (placeButton.value ? placeButton.value + '/' : '');
    return {
      visible: true,
      title: (placeButton.value ? 'Viewing ' : 'Creating ') + placeButton.dataset.desc,
      minwidth: "20%",
      minheight: "30%",
      position: {
        my: 'center',
        at: 'center',
        of: window,
      },
      onHiding: () => {
        const $existingAddressSelector = $('div.address-lookup-search').dxLookup('instance');
        if ($existingAddressSelector) $existingAddressSelector.close();
        const $existingStateSelector = $('div.state-lookup-search').dxLookup('instance');
        if ($existingStateSelector) $existingStateSelector.close();
      },
      dragEnabled: true,
      contentTemplate: (e) => {
        const formContainer = $('<div class="locate-form">');
        Attendees.datagridUpdate.placePopupDxForm = formContainer.dxForm({
          // repaintChangesOnly: true,  // https://github.com/DevExpress/DevExtreme/issues/7295
          readOnly: !Attendees.utilities.editingEnabled,
          formData: {
            ...Attendees.datagridUpdate.placeDefaults,
            content_type: parseInt(placeButton.dataset.contentType),
            object_id: placeButton.dataset.objectId,
          },
          colCount: 12,
          scrollingEnabled: true,
          showColonAfterLabel: false,
          requiredMark: "*",
          labelLocation: "top",
          minColWidth: "20%",
          showValidationSummary: true,
          items: [
            {
              colSpan: 3,
              dataField: "display_name",
              label: {
                text: 'Type',
              },
              helpText: 'what kind of address is this?',
              isRequired: true,
              editorOptions: {
                placeholder: "Main/parent/past, etc",
              },
            },
            {
              colSpan: 3,
              dataField: "display_order",
              label: {
                text: 'Importance',
              },
              helpText: '0 is shown before 1,2...',
              isRequired: true,
              editorOptions: {
                placeholder: "0/1/2/3, etc",
              },
              validationRules: [
                {
                  type: "range",
                  max: 32767,
                  min: 0,
                  message: "display_order should be between 0 and 32767"
                },
                {
                  type: "required",
                  message: "display_order is required"
                },
              ],
            },
            {
              colSpan: 3,
              dataField: "start",
              editorType: "dxDateBox",
              label: {
                text: 'stay from',
              },
              helpText: 'When moved in?',
              editorOptions: {
                type: "date",
                showClearButton: true,
                dateSerializationFormat: "yyyy-MM-dd",
//                onFocusIn: (e) => {
//                  if(!e.component.option("value")) {e.component.option("value", new Date())};
//                },
                placeholder: "click calendar",
              },
            },
            {
              colSpan: 3,
              dataField: "finish",
              editorType: "dxDateBox",
              label: {
                text: 'stay until',
              },
              helpText: 'When moved out?',
              editorOptions: {
                type: "date",
                showClearButton: true,
                dateSerializationFormat: "yyyy-MM-dd",
//                onFocusIn: (e) => {
//                  if(!e.component.option("value")) {e.component.option("value", new Date())};
//                },
                placeholder: "click calendar",
              },
            },
            {
              colSpan: 12,
              dataField: "address.id",
              name: "existingAddressSelector",
              label: {
                text: 'Address without extra',
              },
              editorType: "dxLookup",
              editorOptions: {
                elementAttr: {
                  class: 'address-lookup-search',  // calling closing by the parent
                },
                valueExpr: "id",
                displayExpr: "raw",  // 'formatted' does not exist
                placeholder: "Select a value...",
                searchExpr: ['street_number', 'raw'],
//                searchMode: 'startswith',
                searchPlaceholder: 'Search addresses',
                minSearchLength: 3,  // cause values disappeared in drop down
                searchTimeout: 200,  // cause values disappeared in drop down
                dropDownOptions: {
                  showTitle: false,
                  closeOnOutsideClick: true,
                },
                dataSource: Attendees.datagridUpdate.addressSource,
                onValueChanged: (e) => {
                  if (e.previousValue && e.previousValue !== e.value) {
                    const selectedAddress = $('div.address-lookup-search').dxLookup('instance')._dataSource._items.find(x => x.id === e.value);
                    Attendees.datagridUpdate.placePopupDxForm.updateData('address_extra', null);
//                    Attendees.datagridUpdate.placePopupDxForm.option('formData.address', selectedAddress);
                    Attendees.datagridUpdate.placePopupDxForm.updateData('address', selectedAddress); // https://supportcenter.devexpress.com/ticket/details/t443361
//                    console.log("hi 1302 here is Attendees.datagridUpdate.placePopupDxFormData", Attendees.datagridUpdate.placePopupDxFormData);
//                    console.log("hi 1303 here is selectedAddress: ", selectedAddress);
                    // Attendees.datagridUpdate.placePopupDxForm.getEditor("address_extra").option('value', null);
                    // Attendees.datagridUpdate.placePopupDxForm.getEditor("address.street_number").option('value', selectedAddress.street_number);
                    // Attendees.datagridUpdate.placePopupDxForm.getEditor("address.route").option('value', selectedAddress.route);
                  }
                },
              },
            },
            {
              itemType: "group",
              visible: false,
              name: 'NewAddressItems',
              colSpan: 12,
              colCount: 12,
              items: [
                {
                  colSpan: 4,
                  dataField: "address.street_number",
                  helpText: 'no road name please',
                  label: {
                    text: 'Door number',
                  },
                  editorOptions: {
                    placeholder: "example: '22416'",
                  },
                },
                {
                  colSpan: 4,
                  dataField: "address.route",
                  helpText: 'no door number please',
                  label: {
                    text: 'Road',
                  },
                  editorOptions: {
                    placeholder: "example: 'A street'",
                  },
                },
                {
                  colSpan: 4,
                  dataField: "address_extra",
                  helpText: 'suite/floor number, etc',
                  label: {
                    text: 'Extra: unit/apt',
                  },
                  editorOptions: {
                    placeholder: "example: Apt 2G",
                  },
                },
                {
                  colSpan: 4,
                  dataField: "address.city",
                  name: "locality",
                  helpText: 'Village/Town name',
                  label: {
                    text: 'City',
                  },
                  editorOptions: {
                    placeholder: "example: 'San Francisco'",
                  },
                },
                {
                  colSpan: 4,
                  dataField: "address.postal_code",
                  helpText: 'ZIP code',
                  editorOptions: {
                    placeholder: "example: '94106'",
                  },
                },
                {
                  colSpan: 4,
                  dataField: "address.state_id",
                  //              name: "existingAddressSelector",
                  label: {
                    text: 'State',
                  },
                  editorType: "dxLookup",
                  editorOptions: {
                    elementAttr: {
                      class: 'state-lookup-search',  // calling closing by the parent
                    },
                    valueExpr: "id",
                    displayExpr: (item) => {
                      return item ? item.name + ", " + item.country_name : null;
                    },
                    placeholder: "Example: 'CA'",
                    searchExpr: ['name'],
                    //                searchMode: 'startswith',
                    searchPlaceholder: 'Search states',
                    minSearchLength: 2,  // cause values disappeared in drop down
                    searchTimeout: 200,  // cause values disappeared in drop down
                    dropDownOptions: {
                      showTitle: false,
                      closeOnOutsideClick: true,
                    },
                    dataSource: Attendees.datagridUpdate.stateSource,
                    onValueChanged: (e) => {
                      if (e.previousValue && e.previousValue !== e.value) {
                        const selectedState = $('div.state-lookup-search').dxLookup('instance')._dataSource._items.find(x => x.id === e.value);
                        console.log("hi 1401 here is selectedState: ", selectedState);
                      }
                    },
                  },
                },
              ],
            },
            {
              colSpan: 3,
              itemType: "button",
              horizontalAlignment: "left",
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: "Save Place",
                icon: "save",
                hint: "save Place data in the popup",
                type: "default",
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  if (confirm('are you sure to submit the popup Place Form?')) {
                    const userData = Attendees.datagridUpdate.placePopupDxForm.option('formData');
                    const newStreetNumber = Attendees.datagridUpdate.placePopupDxForm.getEditor("address.street_number").option('value');
                    const newRoute = Attendees.datagridUpdate.placePopupDxForm.getEditor("address.route").option('value');
                    const newAddressExtra = Attendees.datagridUpdate.placePopupDxForm.getEditor("address_extra").option('value');
                    const newCity = Attendees.datagridUpdate.placePopupDxForm.getEditor("address.city").option('value');
                    const newZIP = Attendees.datagridUpdate.placePopupDxForm.getEditor("address.postal_code").option('value');
                    const newStateAttrs = Attendees.datagridUpdate.placePopupDxForm.getEditor("address.state_id")._options;
                    const newAddressText = newStreetNumber + ' ' + newRoute + (newAddressExtra ? ', ' + newAddressExtra : '') + ', ' + newCity + ', ' + newStateAttrs.selectedItem.code + ' ' + newZIP + ', ' + newStateAttrs.selectedItem.country_name;

                    if (!Attendees.datagridUpdate.addressId) {  // no address id means user creating new address
                      userData.address = {
                        raw: 'new',
                        new_address: {  // special object for creating new django-address instance
                          raw: newAddressText,
                          formatted: newAddressText,
                          street_number: newStreetNumber,
                          route: newRoute,
                          locality: newCity,
                          post_code: newZIP,
                          state: newStateAttrs.selectedItem.name,
                          state_code: newStateAttrs.selectedItem.code,
                          country: newStateAttrs.selectedItem.country_name,
                          country_code: newStateAttrs.selectedItem.country_code,
                        },
                      }
                    } else {
                      userData.address.formatted = newAddressText;
                      userData.address.raw = newAddressText;
                    }

                    $.ajax({
                      url: ajaxUrl,
                      data: JSON.stringify(userData),
                      dataType: 'json',
                      contentType: 'application/json; charset=utf-8',
                      method: userData.id ? 'PUT' : 'POST',
                      success: (savedPlace) => {
                        Attendees.datagridUpdate.placePopup.hide();
                        DevExpress.ui.notify(
                          {
                            message: 'saving place success',
                            width: 500,
                            position: {
                              my: 'center',
                              at: 'center',
                              of: window,
                            }
                          }, 'success', 2500);

                        const clickedButtonDescPrefix = placeButton.dataset.desc.split(' (')[0];
                        placeButton.dataset.desc = clickedButtonDescPrefix + ' (' + savedPlace.address.raw + ')';
                        placeButton.textContent = savedPlace.display_name + ': ' + savedPlace.address.raw;
                      },
                      error: (response) => {
                        console.log('Failed to save data for place Form in Popup, error: ', response);
                        console.log('formData: ', userData);
                        DevExpress.ui.notify(
                          {
                            message: 'saving locate error',
                            width: 500,
                            position: {
                              my: 'center',
                              at: 'center',
                              of: window,
                            }
                          }, 'error', 5000);
                      },
                    });
                  }
                },
              },
            },
            {
              colSpan: 3,
              itemType: "button",
              name: "editAddressButton",
              visible: true,
              horizontalAlignment: "left",
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: "Edit the address",
                icon: "edit",
                hint: "Modifying the current address, without creating one",
                type: "success",
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  if (confirm("Are you sure to edit the current address?")) {
                    Attendees.datagridUpdate.placePopupDxForm.itemOption('NewAddressItems', 'visible', true);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("address.id").option('visible', false);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("address.id").option('disable', true);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("editAddressButton").option('visible', false);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("newAddressButton").option('visible', false);
                  }
                },
              },
            },
            {
              colSpan: 3,
              itemType: "button",
              name: "newAddressButton",
              visible: true,
              horizontalAlignment: "left",
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: "Add new address",
                icon: "home",
                hint: "Can't find exiting address, add a new one here",
                type: "normal",
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  if (confirm("Are you sure to add new address?")) {
                    Attendees.datagridUpdate.placePopupDxForm.itemOption('NewAddressItems', 'visible', true);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("address.id").option('visible', false);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("address.id").option('disable', true);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("newAddressButton").option('visible', false);
                    Attendees.datagridUpdate.placePopupDxForm.getEditor("editAddressButton").option('visible', false);
                    Attendees.datagridUpdate.placePopup.option('title', 'Creating Address');
                    Attendees.datagridUpdate.addressId = null;
                  }
                },
              },
            },
            {
              colSpan: 3,
              itemType: "button",
              name: "setFamilyAddressButton",
              visible: true,  // only show if family address is different
              horizontalAlignment: "left",
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: "Overwrite Family Address",
                icon: "group",
                hint: "Copy the address to attendee's first family",
                type: "danger",
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  if (confirm("Are you sure to set the current address to the attendee's first family? (not implement yet)")) {
                    console.log("Hi 1564 Todo 20210515: Please implement this function")
                  }
                },
              },
            },
//            {
//              colSpan: 3,
//              itemType: "button",
//              name: "copyFamilyAddressButton",
//              visible: true, // only show if family address is different
//              horizontalAlignment: "left",
//              buttonOptions: {
//                elementAttr: {
//                  class: 'attendee-form-submits',    // for toggling editing mode
//                },
//                disabled: !Attendees.utilities.editingEnabled,
//                text: "Copy Family address",
//                icon: "group",
//                hint: "Copy address from attendee's first family",
//                type: "danger",
//                useSubmitBehavior: false,
//                onClick: (clickEvent) => {
//                  if(confirm("Are you sure to copy the attendee's first family? (not implement yet)")){
//                    console.log("Hi 1509 Todo 20210515: Please implement this function")
//                  }
//                },
//              },
//            },
          ],
        }).dxForm("instance");
        e.append(formContainer);
      },
    };
  },

  fetchLocateFormData: (placeButton) => {
    if (placeButton.value) {
      const allPlaces = Attendees.datagridUpdate.attendeeFormConfigs.formData.places.concat(Attendees.datagridUpdate.attendeeFormConfigs.formData.familyattendee_set.flatMap(familyattendee => familyattendee.family.places));
      const fetchedPlace = allPlaces.find(x => x.id === placeButton.value);
      if (!Attendees.utilities.editingEnabled && fetchedPlace) {
        Attendees.datagridUpdate.placePopupDxFormData = fetchedPlace;
        Attendees.datagridUpdate.placePopupDxForm.option('formData', fetchedPlace);
        Attendees.datagridUpdate.addressId = fetchedPlace.address && fetchedPlace.address.id;
      } else {
        $.ajax({
          url: $('form#place-update-popup-form').attr('action') + placeButton.value + '/',
          success: (response) => {
            Attendees.datagridUpdate.placePopupDxFormData = response;
            Attendees.datagridUpdate.placePopupDxForm.option('formData', response);
            Attendees.datagridUpdate.placePopupDxForm.option('onFieldDataChanged', (e) => {
              e.component.validate()
            });
            Attendees.datagridUpdate.addressId = Attendees.datagridUpdate.placePopupDxFormData.address && Attendees.datagridUpdate.placePopupDxFormData.address.id;
          },
          error: (response) => console.log('Failed to fetch data for Locate Form in Popup, error: ', response),
        });
      }
    }
  },

  addressSource: new DevExpress.data.CustomStore({
    key: 'id',
    load: (loadOptions) => {
      if (!Attendees.utilities.editingEnabled) return [Attendees.datagridUpdate.placePopupDxFormData.address];

      const deferred = $.Deferred();
      const args = {};

      [
        "skip",
        "take",
        "sort",
        "filter",
        "searchExpr",
        "searchOperation",
        "searchValue",
        "group",
      ].forEach((i) => {
        if (i in loadOptions && Attendees.utilities.isNotEmpty(loadOptions[i]))
          args[i] = loadOptions[i];
      });

      $.ajax({
        url: $('div.datagrid-attendee-update').data('addresses-endpoint'),
        dataType: 'json',
        data: args,
        success: (result) => {
          deferred.resolve(result.data.concat([Attendees.datagridUpdate.placePopupDxFormData.place]), {
            totalCount: result.totalCount,
            summary: result.summary,
            groupCount: result.groupCount
          });
        },
        error: (response) => {
          console.log('ajax error here is response: ', response);
          deferred.reject("Data Loading Error, probably time out?");
        },
        timeout: 7000,
      });

      return deferred.promise();
    },
    byKey: (key) => {
      if (!Attendees.utilities.editingEnabled && Attendees.datagridUpdate.placePopupDxFormData) {
        return [Attendees.datagridUpdate.placePopupDxFormData.address];
      } else {
        const d = new $.Deferred();
        $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.addressesEndpoint, {id: key})
          .done((result) => {
            d.resolve(result.data);
          });
        return d.promise();
      }
    },
  }),

  stateSource: new DevExpress.data.CustomStore({
    key: 'id',
    load: (loadOptions) => {
//      if (!Attendees.utilities.editingEnabled) return [Attendees.datagridUpdate.placePopupDxFormData.address];

      const deferred = $.Deferred();
      const args = {};

      [
        "skip",
        "take",
        "sort",
        "filter",
        "searchExpr",
        "searchOperation",
        "searchValue",
        "group",
      ].forEach((i) => {
        if (i in loadOptions && Attendees.utilities.isNotEmpty(loadOptions[i]))
          args[i] = loadOptions[i];
      });

      $.ajax({
        url: Attendees.datagridUpdate.attendeeAttrs.dataset.statesEndpoint,
        dataType: "json",
        data: args,
        success: (result) => {
          deferred.resolve(result.data, {
            totalCount: result.totalCount,
            summary: result.summary,
            groupCount: result.groupCount
          });
        },
        error: (response) => {
          console.log('ajax error here is response: ', response);
          deferred.reject("Data Loading Error, probably time out?");
        },
        timeout: 7000,
      });

      return deferred.promise();
    },
    byKey: (key) => {
//      if (!Attendees.utilities.editingEnabled && Attendees.datagridUpdate.placePopupDxFormData){
//        return [Attendees.datagridUpdate.placePopupDxFormData.address];
//      }else{
      const d = new $.Deferred();
//        console.log("hi 1647 here is state key: ", key);
      $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.statesEndpoint, {id: key})
        .done((result) => {
          d.resolve(result.data);
        });
      return d.promise();
//      }
    },
  }),


  ///////////////////////  Family Attendees Datagrid in main DxForm  ///////////////////////


  initFamilyAttendeeDatagrid: (data, itemElement) => {
    const $myDatagrid = $("<div id='family-attendee-datagrid-container'>").dxDataGrid(Attendees.datagridUpdate.familyAttendeeDatagridConfig);
    itemElement.append($myDatagrid);
    Attendees.datagridUpdate.familyAttendeeDatagrid = $myDatagrid.dxDataGrid("instance");
  },

  familyAttendeeDatagridConfig: {
    dataSource: {
      store: new DevExpress.data.CustomStore({
        key: "id",
        load: () => {
          return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.familyAttendeesEndpoint);
        },
        byKey: (key) => {
          const d = new $.Deferred();
          $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.familyAttendeesEndpoint, {familyattendee_id: key})
            .done((result) => {
              d.resolve(result.data);
            });
          return d.promise();
        },
        update: (key, values) => {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.familyAttendeesEndpoint + key + '/',
            method: "PATCH",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: "update success, please reload page if changing family",
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, "success", 2000);
            },
          });
        },
        insert: function (values) {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.familyAttendeesEndpoint,
            method: "POST",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: "Create success, please find the new attendee in the table",
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, "success", 2000);
            },
          });
        },
      }),
    },
    onInitNewRow: (e) => {
      DevExpress.ui.notify(
        {
          message: "Let's create a new family member, click away or hit Enter to save. Hit Esc to quit without save",
          width: 500,
          position: {
            my: 'center',
            at: 'center',
            of: window,
          }
        }, "info", 3000);
    },
    allowColumnReordering: true,
    columnAutoWidth: true,
    allowColumnResizing: true,
    columnResizingMode: 'nextColumn',
    rowAlternationEnabled: true,
    hoverStateEnabled: true,
    loadPanel: {
      message: 'Fetching...',
      enabled: true,
    },
    wordWrapEnabled: false,
    grouping: {
      autoExpandAll: true,
    },
    editing: {
      mode: "cell",
      allowUpdating: Attendees.utilities.editingEnabled,
      allowAdding: Attendees.utilities.editingEnabled,
      allowDeleting: false,
    },
    onEditingStart: (info) => {
      if (info.data.attendee && info.data.attendee.id === Attendees.datagridUpdate.attendeeId) {
        info.cancel = true;
      }
    },
    onRowPrepared: (e) => {
      if (e.rowType === 'data' && e.data.attendee && e.data.attendee.id === Attendees.datagridUpdate.attendeeId) {
        e.rowElement.css("color", "SeaGreen");
        e.rowElement.attr('title', "Please scroll up and change main attendee data there!");
      }
    },
    columns: [
      {
        dataField: "family.id",
        validationRules: [{type: "required"}],
        caption: 'Family',
        groupIndex: 0,
        lookup: {
          valueExpr: "id",
          displayExpr: "display_name",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeFamiliesEndpoint),
              byKey: (key) => $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeFamiliesEndpoint + key + '/'),
            }),
          },
        },
      },
      {
        dataField: "role",
        validationRules: [{type: "required"}],
        caption: 'Role',
        lookup: {
          valueExpr: "id",
          displayExpr: "title",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => {
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.relationsEndpoint);
              },
              byKey: (key) => {
                const d = new $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.relationsEndpoint, {relation_id: key})
                  .done((result) => {
                    d.resolve(result.data);
                  });
                return d.promise();
              },
            }),
          },
        },
      },
      {
        dataField: "attendee.gender",
        validationRules: [{type: "required"}],
        caption: 'Gender',
        lookup: {
          valueExpr: "name",
          displayExpr: "name",
          dataSource: Attendees.utilities.genderEnums(),
        }
      },
      {
        caption: 'Full name',
        dataField: "attendee.infos.names.original",
        allowEditing: false,
        cellTemplate: (container, rowData) => {
          if (rowData.data.attendee.id === Attendees.datagridUpdate.attendeeId) {
            $('<span>', {text: rowData.data.attendee.infos.names.original}).appendTo(container);
          } else {
            const attrs = {
              "class": "text-info",
              "text": rowData.data.attendee.infos.names.original,
              "href": Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeUrn + rowData.data.attendee.id,
            };
            $('<a>', attrs).appendTo(container);
          }
        },
      },
      {
        caption: 'First name',
        dataField: "attendee.first_name",
        visible: false,
        validationRules: [
          {
            type: "stringLength",
            max: 25,
            message: "first name cannot exceed 25 characters"
          },
        ],
      },
      {
        caption: 'Last name',
        dataField: "attendee.last_name",
        visible: false,
        validationRules: [
          {
            type: "stringLength",
            max: 25,
            message: "last name cannot exceed 25 characters"
          },
        ],
      },
      {
        caption: 'Last name2',
        dataField: "attendee.last_name2",
        visible: false,
        validationRules: [
          {
            type: "stringLength",
            max: 8,
            message: "last name 2 cannot exceed 8 characters"
          },
        ],
      },
      {
        caption: 'First name2',
        dataField: "attendee.first_name2",
        visible: false,
        validationRules: [
          {
            type: "stringLength",
            max: 12,
            message: "last name 2 cannot exceed 12 characters"
          },
        ],
      },
      {
        dataField: "attendee.division",
        validationRules: [{type: "required"}],
        caption: 'Division',
        lookup: {
          valueExpr: "id",
          displayExpr: "display_name",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => {
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.divisionsEndpoint);
              },
              byKey: (key) => {
                const d = new $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.divisionsEndpoint, {division_id: key})
                  .done((result) => {
                    d.resolve(result.data);
                  });
                return d.promise();
              },
            }),
          },
        }
      },
      {
        dataField: "start",
        dataType: "date",
        editorOptions: {
          dateSerializationFormat: "yyyy-MM-dd",
        },
      },
      {
        dataField: "finish",
        dataType: "date",
        editorOptions: {
          dateSerializationFormat: "yyyy-MM-dd",
        },
      },
    ],
  },


  ///////////////////////  Family Attributes Popup and DxForm  ///////////////////////

  initFamilyAttrPopupDxForm: (event) => {
    const familyAttrButton = event.target;
    Attendees.datagridUpdate.familyAttrPopup = $('div.popup-family-attr-update').dxPopup(Attendees.datagridUpdate.familyAttrPopupDxFormConfig(familyAttrButton)).dxPopup('instance');
    Attendees.datagridUpdate.fetchFamilyAttrFormData(familyAttrButton);
  },

  familyAttrPopupDxFormConfig: (familyAttrButton) => {
    const ajaxUrl = $('form#family-attr-update-popup-form').attr('action') + (familyAttrButton.value ? familyAttrButton.value + '/': '');
    return {
      visible: true,
      title: familyAttrButton.value ? 'Viewing Family' : 'Creating Family',
      minwidth: "20%",
      minheight: "30%",
      position: {
        my: 'center',
        at: 'center',
        of: window,
      },
      dragEnabled: true,
      contentTemplate: (e) => {
        const formContainer = $('<div class="familyAttrForm">');
        Attendees.datagridUpdate.familyAttrPopupDxForm = formContainer.dxForm({
          readOnly: !Attendees.utilities.editingEnabled,
          formData: Attendees.datagridUpdate.familyAttrDefaults,
          colCount: 3,
          scrollingEnabled: true,
          showColonAfterLabel: false,
          requiredMark: "*",
          labelLocation: "top",
          minColWidth: "20%",
          showValidationSummary: true,
          items: [
            {
              colSpan: 1,
              dataField: "display_name",
              label: {
                text: 'Name',
              },
              helpText: 'what family is this?',
              isRequired: true,
              editorOptions: {
                placeholder: "Main/parent/past, etc",
              },
            },
            {
              colSpan: 1,
              dataField: "display_order",
              label: {
                text: 'Importance',
              },
              helpText: '0 is shown before 1,2...',
              isRequired: true,
              editorOptions: {
                placeholder: "0/1/2/3, etc",
              },
              validationRules: [
                {
                  type: "range",
                  max: 32767,
                  min: 0,
                  message: "display_order should be between 0 and 32767"
                },
                {
                  type: "required",
                  message: "display_order is required"
                },
              ],
            },
            {
              colSpan: 1,
              dataField: "division",
              editorType: "dxSelectBox",
              isRequired: true,
              label: {
                text: 'Major Division',
              },
              editorOptions: {
                valueExpr: "id",
                displayExpr: "display_name",
                placeholder: "Select a value...",
                dataSource: new DevExpress.data.DataSource({
                  store: new DevExpress.data.CustomStore({
                    key: "id",
                    loadMode: "raw",
                    load: () => {
                      const d = $.Deferred();
                      $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.divisionsEndpoint).done((response) => {
                        d.resolve(response.data);
                      });
                      return d.promise();
                    },
                  })
                }),
              },
            },

            {
              colSpan: 1,
              itemType: "button",
              horizontalAlignment: "left",
              buttonOptions: {
                elementAttr: {
                  class: 'attendee-form-submits',    // for toggling editing mode
                },
                disabled: !Attendees.utilities.editingEnabled,
                text: "Save Family",
                icon: "save",
                hint: "save Family attr data in the popup",
                type: "default",
                useSubmitBehavior: false,
                onClick: (clickEvent) => {
                  if (Attendees.datagridUpdate.familyAttrPopupDxForm.validate().isValid && confirm('are you sure to submit the popup Family attr Form?')) {
                    const userData = Attendees.datagridUpdate.familyAttrPopupDxForm.option('formData');

                    $.ajax({
                      url: ajaxUrl,
                      data: JSON.stringify(userData),
                      dataType: 'json',
                      contentType: "application/json; charset=utf-8",
                      method: userData.id ? 'PUT' : 'POST',
                      success: (savedFamily) => {
                        Attendees.datagridUpdate.familyAttrPopup.hide();
                        DevExpress.ui.notify(
                          {
                            message: 'saving Family attr success',
                            width: 500,
                            position: {
                              my: 'center',
                              at: 'center',
                              of: window,
                            }
                          }, 'success', 2500);

                        if (familyAttrButton.value) {
                          familyAttrButton.textContent(savedFamily.display_name)
                        } else {
                          Attendees.datagridUpdate.familyButtonFactory({value: savedFamily.id, text: savedFamily.display_name}).insertAfter(familyAttrButton);
                        }
                        Attendees.datagridUpdate.familyAttendeeDatagrid.refresh();
                      },
                      error: (response) => {
                        console.log('2062 Failed to save data for Family attr Form in Popup, error: ', response);
                        console.log('formData: ', userData);
                        DevExpress.ui.notify(
                          {
                            message: 'saving locate error',
                            width: 500,
                            position: {
                              my: 'center',
                              at: 'center',
                              of: window,
                            }
                          }, 'error', 5000);
                      },
                    });
                  }
                },
              },
            },

          ],
        }).dxForm("instance");
        e.append(formContainer);
      }
    };
  },

  fetchFamilyAttrFormData: (familyAttrButton) => {
    if (familyAttrButton.value) {
      const families = Attendees.datagridUpdate.attendeeFormConfigs.formData.familyattendee_set.map(familyattendee => familyattendee.family);
      const fetchedFamily = families.find(x => x.id === familyAttrButton.value);
      if (!Attendees.utilities.editingEnabled && fetchedFamily) {
        Attendees.datagridUpdate.familyAttrPopupDxFormData = fetchedFamily;
        Attendees.datagridUpdate.familyAttrPopupDxForm.option('formData', fetchedFamily);
      } else {
        $.ajax({
          url: $('form#family-attr-update-popup-form').attr('action') + familyAttrButton.value + '/',
          success: (response) => {
            Attendees.datagridUpdate.familyAttrPopupDxFormData = response;
            Attendees.datagridUpdate.familyAttrPopupDxForm.option('formData', response);
          },
          error: (response) => console.log('Failed to fetch data for Family Attr Form in Popup, error: ', response),
        });
      }
    }


  },


  ///////////////////////  Relationship Datagrid in main DxForm  ///////////////////////


  initRelationshipDatagrid: (data, itemElement) => {
    const $relationshipDatagrid = $("<div id='relationship-datagrid-container'>").dxDataGrid(Attendees.datagridUpdate.relationshipDatagridConfig);
    itemElement.append($relationshipDatagrid);
    Attendees.datagridUpdate.relationshipDatagrid = $relationshipDatagrid.dxDataGrid("instance");
  },

  relationshipDatagridConfig: {
    dataSource: {
      store: new DevExpress.data.CustomStore({
        key: "id",
        load: () => {
          return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.relationshipsEndpoint);
        },
        byKey: (key) => {
          const d = new $.Deferred();
          $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.relationshipsEndpoint + key + '/')
            .done((result) => {
              d.resolve(result.data);
            });
          return d.promise();
        },
        update: (key, values) => {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.relationshipsEndpoint + key + '/',
            method: "PATCH",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: "update success, please reload page if changing family",
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, "success", 2000);
            },
          });
        },
        insert: function (values) {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.relationshipsEndpoint,
            method: "POST",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: "Create success, please find the new relationship in the table",
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, "success", 2000);
            },
          });
        },
      }),
    },
    onRowInserted: (e) => {
      Attendees.datagridUpdate.relationshipDatagrid.refresh();  // or the new inserted to_attendee dxlookup won't show
    },
    onInitNewRow: (e) => {
      e.data.from_attendee = Attendees.datagridUpdate.attendeeId;
      DevExpress.ui.notify(
        {
          message: "Let's create a relationship, click away or hit Enter to save. Hit Esc to quit without save",
          width: 500,
          position: {
            my: 'center',
            at: 'center',
            of: window,
          }
        }, "info", 3000);
    },
    allowColumnReordering: true,
    columnAutoWidth: true,
    allowColumnResizing: true,
    columnResizingMode: 'nextColumn',
    rowAlternationEnabled: true,
    hoverStateEnabled: true,
    loadPanel: {
      message: 'Fetching...',
      enabled: true,
    },
    wordWrapEnabled: true,
    grouping: {
      autoExpandAll: true,
    },
    editing: {
      mode: "cell",
      allowUpdating: Attendees.utilities.editingEnabled,
      allowAdding: Attendees.utilities.editingEnabled,
      allowDeleting: false,
    },
    onRowInserting: (rowData) => {
      const infos = {show_secret: {}};
      if (rowData.data.infos && rowData.data.infos.show_secret) {
        infos.show_secret[Attendees.utilities.userAttendeeId] = true;
      }
      rowData.data.infos = infos;
    },
    onRowUpdating: (rowData) => {
      if (rowData.newData.infos && 'show_secret' in rowData.newData.infos) { // value could be intentionally false to prevent someone seeing it
        const showSecret = rowData.oldData.infos.show_secret;
        const isItSecretWithCurrentUser = rowData.newData.infos.show_secret;
        if (isItSecretWithCurrentUser) {
          showSecret[Attendees.utilities.userAttendeeId] = true;
        } else {
          delete showSecret[Attendees.utilities.userAttendeeId];
        }
        rowData.newData.infos.show_secret = showSecret;
      }
    },
    columns: [
      {
        dataField: "relation",
        validationRules: [{type: "required"}],
        caption: 'Role',
        lookup: {
          valueExpr: "id",
          displayExpr: "title",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => {
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.relationsEndpoint, {take: 100});
              },
              byKey: (key) => {
                const d = new $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.relationsEndpoint, {relation_id: key})
                  .done((result) => {
                    d.resolve(result.data);
                  });
                return d.promise();
              },
            }),
          },
        },
      },
      {
        dataField: "to_attendee",
        validationRules: [{type: "required"}],
        caption: 'Attendee',
        lookup: {
          valueExpr: "id",
          displayExpr: (item) => {
            return item ? '(' + item.gender[0] + ") " + item.infos.names.original : null;
          },
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: (searchOpts) => {
                const params = {};
                if (searchOpts.searchValue) {
                  const searchCondition = ['infos__names', searchOpts.searchOperation, searchOpts.searchValue];
                  params.filter = JSON.stringify(searchCondition);
                }
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.relatedAttendeesEndpoint, params);
              },
              byKey: (key) => {
                const d = new $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.relatedAttendeesEndpoint + key + '/')
                  .done((result) => {
                    d.resolve(result.data);
                  });
                return d.promise();
              },
            }),
          },
        },
      },
      {
        dataField: "in_family",
        editorOptions: {
          showClearButton: true,
        },
        caption: 'Family',
        groupIndex: 0,
        lookup: {
          valueExpr: "id",
          displayExpr: "display_name",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeFamiliesEndpoint),
              byKey: (key) => {
                if (key) {
                  $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeFamiliesEndpoint + key + '/');
                }
              },
            }),
          },
        },
      },
      {
        dataField: "scheduler",
        caption: "Can change main attendee's schedule",
        dataType: "boolean",
        calculateCellValue: (rowData) => {
          return rowData.scheduler ? rowData.scheduler : false;
        },
      },
      {
        dataField: "emergency_contact",
        caption: 'Contact when Main attendee in emergency',
        dataType: "boolean",
        calculateCellValue: (rowData) => {
          return rowData.scheduler ? rowData.scheduler : false;
        },
      },
      {
        caption: 'Secret shared with you',
        dataField: 'infos.show_secret',
        calculateCellValue: (rowData) => {
          if (rowData.infos) {
            const showSecret = rowData.infos.show_secret;
            const result = !!(showSecret && showSecret[Attendees.utilities.userAttendeeId]);
            return result;
          } else {
            return false;
          }
        },
        dataType: 'boolean',
      },
      {
        dataField: "start",
        dataType: "datetime",
        format: "MM/dd/yyyy",
      },
      {
        dataField: "finish",
        dataType: "datetime",
        format: "MM/dd/yyyy",
      },
    ],
  },


  ///////////////////////  Past Datagrids (dynamic) in main DxForm  ///////////////////////

  initPastDatagrid: (data, itemElement, args) => {
    const $pastDatagrid = $("<div id='" + args.type + "-past-datagrid-container'>").dxDataGrid(Attendees.datagridUpdate.pastDatagridConfig(args));
    itemElement.append($pastDatagrid);
    return $pastDatagrid.dxDataGrid("instance");
  },

  pastDatagridConfig: (args) => { // {type: 'education', dataFields: {display_name: 'display_name', start: 'start'}, extraDatagridOpts:{editing:{mode:'popup'}}}
    const columns = [
      {
        dataField: "category",
        validationRules: [{type: "required"}],
        lookup: {
          valueExpr: "id",
          displayExpr: "display_name",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => {
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.categoriesEndpoint, {
                  take: 100,
                  type: args.type,
                });
              },
              byKey: (key) => {
                const d = new $.Deferred();
                $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.categoriesEndpoint + key + '/')
                  .done((result) => {
                    d.resolve(result);
                  });
                return d.promise();
              },
            }),
          },
        },
      },

      {
        dataField: "display_name",
      },
      {
        caption: 'Secret shared with you',
        dataField: 'infos.show_secret',
        width: '18%',
        calculateCellValue: (rowData) => {
          if (rowData.infos) {
            const showSecret = rowData.infos.show_secret;
            return !!(showSecret && showSecret[Attendees.utilities.userAttendeeId]);
          } else {
            return false;
          }
        },
        dataType: 'boolean',
      },
      {
        dataField: "infos.comment",
        caption: 'Comment',
        dataType: "string",
        width: '32%',
      },
      {
        dataField: "when",
        dataType: "date",
      },
      {
        dataField: "finish",
        dataType: "date",
      },
    ];

    return {
      dataSource: {
        store: new DevExpress.data.CustomStore({
          key: "id",
          load: () => {
            return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.pastsEndpoint, {category__type: args.type});
          },
          byKey: (key) => {
            const d = new $.Deferred();
            $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.pastsEndpoint + key + '/')
              .done((result) => {
                d.resolve(result.data);
              });
            return d.promise();
          },
          update: (key, values) => {
            return $.ajax({
              url: Attendees.datagridUpdate.attendeeAttrs.dataset.pastsEndpoint + key + '/?' + $.param({category__type: args.type}),
              method: "PATCH",
              dataType: 'json',
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify(values),
              success: (result) => {
                DevExpress.ui.notify(
                  {
                    message: 'update ' + args.type + ' success',
                    width: 500,
                    position: {
                      my: 'center',
                      at: 'center',
                      of: window,
                    }
                  }, "success", 2000);
              },
            });
          },
          insert: function (values) {
            const subject = {
              content_type: Attendees.datagridUpdate.attendeeAttrs.dataset.attendeeContenttypeId,
              object_id: Attendees.datagridUpdate.attendeeId,
            };
            return $.ajax({
              url: Attendees.datagridUpdate.attendeeAttrs.dataset.pastsEndpoint,
              method: "POST",
              dataType: 'json',
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify({...values, ...subject}),
              success: (result) => {
                DevExpress.ui.notify(
                  {
                    message: 'Create ' + args.type + ' success',
                    width: 500,
                    position: {
                      my: 'center',
                      at: 'center',
                      of: window,
                    }
                  }, "success", 2000);
              },
            });
          },
        }),
      },
      onRowInserting: (rowData) => {
        const infos = {show_secret: {}, comment: rowData.data.infos && rowData.data.infos.comment};
        if (rowData.data.infos && rowData.data.infos.show_secret) {
          infos.show_secret[Attendees.utilities.userAttendeeId] = true;
        }
        rowData.data.infos = infos;
      },
      onInitNewRow: (e) => {  // don't assign e.data or show_secret somehow messed up
        DevExpress.ui.notify(
          {
            message: "Let's create a " + args.type + ", click away or hit Enter to save. Hit Esc to quit without save",
            width: 500,
            position: {
              my: 'center',
              at: 'center',
              of: window,
            }
          }, "info", 3000);
      },
      allowColumnReordering: true,
      columnAutoWidth: true,
      allowColumnResizing: true,
      columnResizingMode: 'nextColumn',
      rowAlternationEnabled: true,
      hoverStateEnabled: true,
      loadPanel: {
        message: 'Fetching...',
        enabled: true,
      },
      wordWrapEnabled: false,
      width: '100%',
      grouping: {
        autoExpandAll: true,
      },
      onRowUpdating: (rowData) => {
        if (rowData.newData.infos) { // could be comment or show_secret or both
          const updatingInfos = rowData.oldData.infos || {};
          if ('show_secret' in rowData.newData.infos) {  // infos.show_secret could be false or true
            let updatingShowSecret = typeof (updatingInfos.show_secret) === 'object' && updatingInfos.show_secret || {};  // could show_secret to others
            if (rowData.newData.infos.show_secret) {  // boolean from UI but db needs to store attendee
              updatingShowSecret[Attendees.utilities.userAttendeeId] = true;
            } else {
              delete updatingShowSecret[Attendees.utilities.userAttendeeId];
            }
            updatingInfos.show_secret = updatingShowSecret;
          }
          if ('comment' in rowData.newData.infos) {  // UI may send this or not
            updatingInfos.comment = rowData.newData.infos.comment;
          }
          rowData.newData.infos = updatingInfos;
        }
      },
      columns: columns.flatMap(column => {
        if (column.dataField in args.dataFieldAndOpts) {
          return [{...column, ...args.dataFieldAndOpts[column.dataField]}];
        } else {
          return [];
        }
      }),
    };
  },

  noteEditingArgs: {
    mode: "popup",
    popup: {
      showTitle: true,
      title: "Editing note of Attendee"
    },
    form: {
      items: [
        {
          dataField: 'category',
        },
        {
          dataField: "display_name",
        },
        {
          dataField: 'infos.show_secret',
        },
        {
          dataField: "when",
        },
        {
          dataField: "infos.comment",
          editorType: "dxTextArea",
          colSpan: 2,
          editorOptions: {
            autoResizeEnabled: true,
          }
        },
      ],
    },
  },


  ///////////////////////  AttendingMeet Datagrid in main DxForm  ///////////////////////

  initAttendingMeetsDatagrid: (data, itemElement) => {
    const $attendingMeetDatagrid = $("<div id='attendingmeet-datagrid-container'>").dxDataGrid(Attendees.datagridUpdate.attendingMeetDatagridConfig);
    itemElement.append($attendingMeetDatagrid);
    Attendees.datagridUpdate.attendingMeetDatagrid = $attendingMeetDatagrid.dxDataGrid('instance');
  },

  attendingMeetDatagridConfig: {
    dataSource: {
      store: new DevExpress.data.CustomStore({
        key: "id",
        load: () => {
          return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendingmeetsEndpoint);
        },
        byKey: (key) => {
          const d = new $.Deferred();
          $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.attendingmeetsEndpoint + key + '/')
            .done((result) => {
              d.resolve(result.data);
            });
          return d.promise();
        },
        update: (key, values) => {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.attendingmeetsEndpoint + key + '/',
            method: 'PATCH',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: 'update success',
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, 'success', 2000);
            },
          });
        },
        insert: function (values) {
          return $.ajax({
            url: Attendees.datagridUpdate.attendeeAttrs.dataset.attendingmeetsEndpoint,
            method: "POST",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(values),
            success: (result) => {
              DevExpress.ui.notify(
                {
                  message: 'Create success, please find the new activity in the table',
                  width: 500,
                  position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                  }
                }, 'success', 2000);
            },
          });
        },
      }),
    },
    onRowInserted: (e) => {
      Attendees.datagridUpdate.attendingMeetDatagrid.refresh();
    },
    onInitNewRow: (e) => {
      for (const [key, value] of Object.entries(Attendees.datagridUpdate.attendingmeetDefaults)) {
        e.data[key] = value;
      }
    },
    allowColumnReordering: true,
    columnAutoWidth: true,
    allowColumnResizing: true,
    columnResizingMode: 'nextColumn',
    rowAlternationEnabled: true,
    hoverStateEnabled: true,
    loadPanel: {
      message: 'Fetching...',
      enabled: true,
    },
    wordWrapEnabled: true,
    grouping: {
      autoExpandAll: true,
    },
    columns: [
      {
        dataField: 'attending',
        validationRules: [{type: 'required'}],
        visible: false,
        lookup: {
          valueExpr: 'id',
          displayExpr: 'attending_label',
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: 'id',
              load: (e) => {
                return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.attendingsEndpoint);
              },
              byKey: (key) => {
                if (key) {
                  const d = $.Deferred();
                  $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.attendingsEndpoint + key + '/').done((response) => {
                    d.resolve(response);
                  });
                  return d.promise();
                }
              },
            }),
          },
        },
      },
      {
        dataField: 'assembly',
        groupIndex: 0,
        validationRules: [{type: 'required'}],
        caption: 'Group (Assembly)',
        setCellValue: (rowData, value) => {
          rowData.assembly = value;
          rowData.meet = null;
          rowData.character = null;
        },
        lookup: {
          valueExpr: 'id',
          displayExpr: 'display_name',
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: 'id',
              load: () => $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.assembliesEndpoint),
              byKey: (key) => {
                if (key) {
                  const d = $.Deferred();
                  $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.assembliesEndpoint + key + '/').done((response) => {
                    d.resolve(response);
                  });
                  return d.promise();
                }
              },
            }),
          },
        },
      },
      {
        dataField: 'meet',
        caption: 'Activity (Meet)',
        validationRules: [{type: 'required'}],
        lookup: {
          valueExpr: 'id',
          displayExpr: 'display_name',
          dataSource: (options) => {
            return {
              filter: options.data ? {'assemblies[]': options.data.assembly} : null,
              store: new DevExpress.data.CustomStore({
                key: 'id',
                load: (searchOpts) => {
                  return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.meetsEndpoint, searchOpts.filter);
                },
                byKey: (key) => {
                  const d = new $.Deferred();
                  $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.meetsEndpoint + key + '/')
                    .done((result) => {
                      d.resolve(result);
                    });
                  return d.promise();
                },
              }),
            };
          },
        },
      },
      {
        dataField: 'character',
        lookup: {
          valueExpr: 'id',
          displayExpr: 'display_name',
          dataSource: (options) => {
            return {
              filter: options.data ? {'assemblies[]': options.data.assembly} : null,
              store: new DevExpress.data.CustomStore({
                key: 'id',
                load: (searchOpts) => {
                  return $.getJSON(Attendees.datagridUpdate.attendeeAttrs.dataset.charactersEndpoint, searchOpts.filter);
                },
                byKey: (key) => {
                  const d = new $.Deferred();
                  $.get(Attendees.datagridUpdate.attendeeAttrs.dataset.charactersEndpoint + key + '/')
                    .done((result) => {
                      d.resolve(result);
                    });
                  return d.promise();
                },
              }),
            };
          }
        },
      },
      {
        dataField: "category",
        validationRules: [{type: 'required'}],
      },
      {
        dataField: "start",
        validationRules: [{type: 'required'}],
        dataType: "datetime",
        format: "MM/dd/yyyy",
        editorOptions: {
          type: "datetime",
          dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
        },
      },
      {
        dataField: "finish",
        validationRules: [{type: 'required'}],
        dataType: "datetime",
        format: "MM/dd/yyyy",
        editorOptions: {
          type: "datetime",
          dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
        },
      },
    ],
  },

  attendingMeetEditingArgs: {
    mode: 'popup',
    popup: {
      showTitle: true,
      title: 'Editing Attendee activities'
    },
    form: {
      items: [
        {
          colSpan: 2,
          dataField: 'attending',
        },
        {
          dataField: 'assembly',
        },
        {
          dataField: 'meet',
        },
        {
          dataField: 'character',
          editorOptions: {
            showClearButton: true,
          }
        },
        {
          dataField: 'category',
        },
        {
          dataField: 'start',
        },
        {
          dataField: 'finish',
        },
      ],
    },
  },
};

$(document).ready(() => {
  Attendees.datagridUpdate.init();
});
