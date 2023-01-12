let productList = [];
function getInventoryUrl(){

	var baseUrl = $("meta[name=baseUrl]").attr("content")
	return baseUrl + "/api/inventory";
}
function getProductUrl(){

	var baseUrl = $("meta[name=baseUrl]").attr("content")
	return baseUrl + "/api/product";
}
//BUTTON ACTIONS
function updateInventory(event){
	//Get the ID
	var id = $('#product-select').children("option:selected").val();
	var url = getInventoryUrl() + "/" + id;
	var quantity = $('#inputQuantity').val();
    var newInventory = {"id":id,"quantity":quantity};
    var newInventoryJson = JSON.stringify(newInventory);

	$.ajax({
	   url: url,
	   type: 'PUT',
	   data: newInventoryJson,
	   headers: {
       	'Content-Type': 'application/json'
       },
	   success: function(response) {
	   		getInventoryList();
	   },
	   error: handleAjaxError
	});

	return false;
}
function addInventory(event){
    var quantity = $('#inputQuantity').val();
    var id = $('#product-select').children("option:selected").val();
    var newInventory = {"id":id,"quantity":quantity};
    var newInventoryJson = JSON.stringify(newInventory);
    var url = getInventoryUrl();

    $.ajax({
       url: url,
       type: 'POST',
       data: newInventoryJson,
       headers: {
        'Content-Type': 'application/json'
       },
       success: function(response) {
            getInventoryList();
       },
       error: handleAjaxError
    });

    return false;
}


function getInventoryList(){
	var url = getInventoryUrl();
	$.ajax({
	   url: url,
	   type: 'GET',
	   success: function(inventoryData) {
	   		getProductList(inventoryData);
	   },
	   error: handleAjaxError
	});
}
function setupProductSelect(){
    var url = getProductUrl();
    $.ajax({
       url: url,
       type: 'GET',
       success: function(productData) {
        productList = [...productData];
        displayProductSelect(productData);
       },
       error: handleAjaxError
    });

}
function getProductList(inventoryData){
	var productUrl = getProductUrl();
	$.ajax({
		url: productUrl,
		type: 'GET',
		success: function(productData) {
				displayInventoryList(productData,inventoryData);
		},
		error: handleAjaxError
	 });
}

function deleteInventory(id){
	var url = getInventoryUrl() + "/" + id;

	$.ajax({
	   url: url,
	   type: 'DELETE',
	   success: function(data) {
	   		getInventoryList();
	   },
	   error: handleAjaxError
	});
}

// FILE UPLOAD METHODS
var fileData = [];
var errorData = [];
var processCount = 0;


function processData(){
	var file = $('#inventoryFile')[0].files[0];
	readFileData(file, readFileDataCallback);
}

function readFileDataCallback(results){
	fileData = results.data;
	uploadRows();
}

function uploadRows(){
	//Update progress
	updateUploadDialog();
	//If everything processed then return
	if(processCount==fileData.length){
		return;
	}

	//Process next row
	var row = fileData[processCount];
	processCount++;

	var json = JSON.stringify(row);
	var url = getInventoryUrl();

	//Make ajax call
	$.ajax({
	   url: url,
	   type: 'POST',
	   data: json,
	   headers: {
       	'Content-Type': 'application/json'
       },
	   success: function(response) {
	   		uploadRows();
	   },
	   error: function(response){
	   		row.error=response.responseText
	   		errorData.push(row);
	   		uploadRows();
	   }
	});

}

function downloadErrors(){
	writeFileData(errorData);
}

//UI DISPLAY METHODS
function displayProductSelect(productList){
    var productSelect = $('#product-select');
    for(product of productList){
        productSelect.append("<option value="+product.id+">"+product.name+"</option>");
    }
}

function displayInventoryList(productData,inventoryData){
	var $tbody = $('#inventory-table').find('tbody');
	var result = {};
    for (var i = 0; i < productData.length; i++) {
      result[productData[i].id] = productData[i].name;
    }
	$tbody.empty();
	for(var i in inventoryData){
		var e = inventoryData[i];
		var row = '<tr>'
		+ '<td>' + result[e.id] + '</td>'
		+ '<td>'  + e.quantity + '</td>'
		+ '</tr>';
        $tbody.append(row);
	}
}

function resetUploadDialog(){
	//Reset file name
	var $file = $('#inventoryFile');
	$file.val('');
	$('#inventoryFileName').html("Choose File");
	//Reset various counts
	processCount = 0;
	fileData = [];
	errorData = [];
	//Update counts
	updateUploadDialog();
}

function updateUploadDialog(){
	$('#rowCount').html("" + fileData.length);
	$('#processCount').html("" + processCount);
	$('#errorCount').html("" + errorData.length);
}

function updateFileName(){
	var $file = $('#inventoryFile');
	var fileName = $file.val();
	$('#inventoryFileName').html(fileName);
}

function displayUploadData(){
 	resetUploadDialog();
	$('#upload-inventory-modal').modal('toggle');
}

function displayInventory(data){
	$("#inventory-edit-form input[name=quantity]").val(data.quantity);
	$("#inventory-edit-form input[name=id]").val(data.id);
	$('#edit-inventory-modal').modal('toggle');
}
//INITIALIZATION CODE
function init(){
	$('#update-inventory').click(updateInventory);
	$('#add-inventory').click(addInventory);
	$('#refresh-data').click(getInventoryList);
	$('#upload-data').click(displayUploadData);
	$('#process-data').click(processData);
	$('#download-errors').click(downloadErrors);
    $('#inventoryFile').on('change', updateFileName)
}

$(document).ready(init);
$(document).ready(getInventoryList);
$(document).ready(setupProductSelect);
