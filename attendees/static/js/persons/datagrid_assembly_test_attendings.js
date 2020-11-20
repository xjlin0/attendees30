Attendees.testAttendings = {
  init: () => {
    console.log("attendees/static/js/persons/datagrid_assembly_test_attendings.js");
    Attendees.testAttendings.startDataGrid();
  },

  startDataGrid: () => {
    Attendees.testAttendings.dataGridOpts['dataSource'] = Attendees.testAttendings.customStore;
    $("div.attendings").dxDataGrid(Attendees.testAttendings.dataGridOpts).dxDataGrid("instance");
  },

  customStore: new DevExpress.data.CustomStore({
    key: "id",
    load: (loadOptions) => {
      const deferred = $.Deferred();
      const args = {};

      [
        "skip",
        "take",
        "requireTotalCount",
        "requireGroupCount",
        "sort",
        "filter",
        "totalSummary",
        "group",
        "groupSummary"
      ].forEach((i) => {
          if (i in loadOptions && Attendees.utilities.isNotEmpty(loadOptions[i]))
              args[i] = JSON.stringify(loadOptions[i]);
      });

      $.ajax({
        url: "/persons/api/odata_attendings/",
        dataType: "json",
        data: args,
        success: (result) => {
          deferred.resolve(result.data, {
            totalCount: result.totalCount,
            summary:    result.summary,
            groupCount: result.groupCount
          });
        },
        error: () => {
          deferred.reject("Data Loading Error, probably time out?");
        },
        timeout: 30000,
      });

      return deferred.promise();
    }
  }),

  dataGridOpts: {
    dataSource: null, // set later in startDataGrid()


    filterRow: { visible: true },  //filter doesn't work with fields with calculateDisplayValue yet
    searchPanel: { visible: true },   //search doesn't work with fields with calculateDisplayValue yet
    allowColumnReordering: true,
    columnAutoWidth: true,
    allowColumnResizing: true,
    columnResizingMode: 'nextColumn',
    rowAlternationEnabled: true,
    hoverStateEnabled: true,
    loadPanel: {
      enabled: true
    },
    wordWrapEnabled: false,
    grouping: {
      autoExpandAll: true,
    },
    groupPanel: {
      visible: "auto",
    },
    columnChooser: {
      enabled: true,
      mode: "select",
    },
    columnFixing: {
      enabled: true
    },
    onCellPrepared: e => e.rowType === "header" && e.column.dataHtmlTitle && e.cellElement.attr("title", e.column.dataHtmlTitle),


    showBorders: false,
    remoteOperations: true,
    paging: {
        pageSize:10
    },
    pager: {
        showPageSizeSelector: true,
        allowedPageSizes: [10, 15, 100]
    },
    columns: [
      {
        caption: "attending_id",
        dataField: "id",
        dataType: "number",
      },
      {
        caption: "attendee header",
        dataField: "attendee",
        calculateCellValue: rowData => {
          const name2 = [rowData.attendee.last_name2, rowData.attendee.first_name2].join(''); // no space
          return [rowData.attendee.first_name, rowData.attendee.last_name, name2].join(' ').trim().replace('  ', ' ')
        },
      },
      {
        dataHtmlTitle: "showing only divisions of current user organization",
        caption: "division",
        dataField: "attendee.division",
        lookup: {
          valueExpr: "id",
          displayExpr: "display_name",
          dataSource: {
            store: new DevExpress.data.CustomStore({
              key: "id",
              load: () => {
                return $.getJSON($('div.attendings').data('divisions-endpoint'));
              },
            }),
          },
        },
      },
    ]
  },

//  fetchAttendings: (event) => {
//    Attendees.utilities.alterCheckBoxAndValidations(event.currentTarget, 'input.select-all');
//
//    let finalUrl = null;
//    const $optionForm = $(event.delegateTarget);
//    const $meetsSelectBox = $optionForm.find('select.filter-meets');
//    const $charactersSelectBox = $optionForm.find('select.filter-characters');
//    const meets = $meetsSelectBox.val() || [];
//    const characters = $charactersSelectBox.val() || [];
//    const $attendingDatagrid = $("div.attendings").dxDataGrid("instance");
//    const availableMeets = JSON.parse(document.querySelector('div.attendings').dataset.availableMeets);
//
//    if (meets.length && characters.length) {
//      const url = $('div.attendings').data('attendings-endpoint');
//      const searchParams = new URLSearchParams();
//      meets.forEach(meet => { searchParams.append('meets[]', meet)});
//      characters.forEach(character => { searchParams.append('characters[]', character)});
//      finalUrl = `${url}?${searchParams.toString()}`
//    }
//
//    meetsToHide = $(Attendees.attendings.visibleColumns).not(meets).get();
//    meetsToShow = $(meets).not(Attendees.attendings.visibleColumns).get();
//
//    $attendingDatagrid.beginUpdate();
//    $attendingDatagrid.option("dataSource", finalUrl);
//    meetsToHide.forEach( meet=> $attendingDatagrid.columnOption(meet, "visible", false) );
//    meetsToShow.forEach( meet=> $attendingDatagrid.columnOption(meet, "visible", true) );
//    $attendingDatagrid.endUpdate();
//
//    Attendees.attendings.visibleColumns = meets;
//
//  },
//
//  attendingsFormats: {
//    dataSource: null,
////    height: '80%',
//    filterRow: { visible: true },  //filter doesn't work with fields with calculateDisplayValue yet
//    searchPanel: { visible: true },   //search doesn't work with fields with calculateDisplayValue yet
//    allowColumnReordering: true,
//    columnAutoWidth: true,
//    allowColumnResizing: true,
//    columnResizingMode: 'nextColumn',
//    rowAlternationEnabled: true,
//    hoverStateEnabled: true,
//    loadPanel: {
//      message: 'Fetching...',
//      enabled: true
//    },
//    wordWrapEnabled: false,
//    grouping: {
//      autoExpandAll: true,
//    },
//    groupPanel: {
//      visible: "auto",
//    },
//    columnChooser: {
//      enabled: true,
//      mode: "select",
//    },
//    columnFixing: {
//      enabled: true
//    },
//    onCellPrepared: e => e.rowType === "header" && e.column.dataHtmlTitle && e.cellElement.attr("title", e.column.dataHtmlTitle),
//    // compatible with cellHintEnabled (hint didn't work) and make entire column shows title. https://supportcenter.devexpress.com/ticket/details/t541796
////    scrolling: {
////            mode: "virtual",
////    },
//  },
//
//  visibleColumns: [
//  ],
//
//  setAttendingsFormatsColumns: () => {
//
//    const meetColumns=[];
//    const availableMeets = JSON.parse(document.querySelector('div.attendings').dataset.availableMeets); // $('div.attendings').data('available-meets');
//    // const availableCharacters = JSON.parse(document.querySelector('div.attendings').dataset.availableCharacters);
//
//    availableMeets.forEach(meet => {
//      meetColumns.push({
//        visible: false,
//        caption: meet.display_name,
//        dataField: meet.slug,  // used as the key for toggling visibility
//        calculateCellValue: rowData => rowData.meets_info[meet.slug],
//      })
//    });
//
//    Attendees.attendings.attendingsFormats['columns']=[...Attendees.attendings.attendingsFormatsColumnsStart, ...meetColumns, ...Attendees.attendings.attendingsFormatsColumnsEnd]
//  },
//
//
//  attendingsFormatsColumnsStart: [
//    {
//      dataField: "id",
//      allowGrouping: false,
//    },
//    {
//      caption: 'attendee',
//      dataField: "attendee.display_label",
//    },
//    {
//      dataField: "attendee.division",
//      lookup: {
//        valueExpr: "id",
//        displayExpr: "display_name",
//        dataSource: {
//          store: new DevExpress.data.CustomStore({
//              key: "id",
//              load: () => {
//                return $.getJSON($('div.attendings').data('divisions-endpoint'));
//              },
//          }),
//        },
//      }
//    },
//  ],
//
//  attendingsFormatsColumnsEnd: [
////    {
////      dataField: "registration",
////      lookup: {
////          valueExpr: "id",
////          displayExpr: "main_attendee",
////          dataSource: {
////              store: new DevExpress.data.CustomStore({
////                  key: "id",
////                  load: () => {
////                    const $selectedMeets = $('select.filter-meets').val();
////                    if ($selectedMeets.length > 0) {
////                      return $.getJSON($('div.attendings').data('characters-endpoint'), {meets: $selectedMeets});
////                    }
////                  },
////              }),
////          },
////      }
////    },   // template for using registration intead
//    {
//      caption: 'Birthday',
//      dataHtmlTitle: "Could be real or estimated, depends on user inputs",
//      dataField: "attendee",
//      calculateCellValue: rowData => {
//        const birthday = rowData.attendee.actual_birthday ? rowData.attendee.actual_birthday : rowData.attendee.estimated_birthday;
//        return birthday ? new Date(birthday).toLocaleDateString() : null;
//      },
//    },
//    {
//      caption: "Self emails",
//      dataField: "attendee.self_email_addresses",
////        width: '15%',
//      calculateCellValue: rowData => rowData.attendee.self_email_addresses,
//    },
//    {
//      caption: "Self phones",
//      dataField: "attendee.self_phone_numbers",
//      calculateCellValue: rowData => rowData.attendee.self_phone_numbers,
//    },
//  ],
//
//  setDefaults: () => {
//    const urlParams = new URLSearchParams(window.location.search);
//    const characters = urlParams.getAll('characters');
//    document.getElementById('filter-characters').value = characters;
//
//    document.getElementById('filter-meets').value = [];
//  },
}

$(document).ready(() => {
  Attendees.testAttendings.init();
});
