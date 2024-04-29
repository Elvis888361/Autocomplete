frappe.ui.form.on('Address', {
    onload: function(frm) {
        var html_field = frm.fields_dict['custom_address'].wrapper;

        var label = document.createElement('label');
        label.innerHTML = 'Create An Autocomplete field';
        label.setAttribute('class', 'form-label mb-2');

        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('class', 'form-control');
        input.setAttribute('placeholder', 'Enter address...');

        var suggestionsContainer = $('<div>').attr('id', 'suggestions-container');
        suggestionsContainer.css('margin-top', '5px');

        html_field.appendChild(label);
        html_field.appendChild(input);
        html_field.appendChild(suggestionsContainer[0]);
    },

    refresh: function(frm) {
        var inputField = frm.fields_dict['custom_address'].wrapper.querySelector('input');
        var suggestionsContainer = $('#suggestions-container');
        
        inputField.addEventListener('input', function(event) {
            var query = event.target.value;
            if (query.length > 2) {
                frappe.call({
                    method: 'estes_api.rest.autocomplete',
                    args: {
                        query: query
                    },
                    callback: function(data) {
                        console.log("Autocomplete data:", data);
                        suggestionsContainer.empty();
                        if (data && Array.isArray(data.message)) {
                            data.message.forEach(function(address) {
                                if (address.address_line1 && address.city && address.country && address.postcode) {
                                    var formattedAddress = '<button class="btn btn-outline-primary suggestion" style="margin-right: 5px;"';
                                    formattedAddress += ' data-address=\'' + JSON.stringify(address) + '\'>';
                                    formattedAddress += '<b>' + address.address_line1 + '</b>' + ', ' + address.city + ', ' + address.country + ', ';
                                    formattedAddress += '<b>' + address.postcode + '</b>';
                                    formattedAddress += '</button>';
                                    suggestionsContainer.append(formattedAddress);
                                }
                            });
                            suggestionsContainer.show(); 
                        } else {
                            console.error("Invalid or empty data returned:", data);
                        }
                    },
                    error: function(err) {
                        console.error("Error while fetching autocomplete data:", err);
                    }
                });
            } else {
                console.log("Query length is less than 3 characters, clearing suggestions.");
                suggestionsContainer.empty().hide(); 
            }
        });

        suggestionsContainer.on('click', '.suggestion', function() {
            var selectedAddress = $(this).data('address');
            if (selectedAddress) {
                console.log("Selected address:", selectedAddress);
                setAddressValues(selectedAddress, frm);
                inputField.value = ''; 
                suggestionsContainer.empty().hide();
            } else {
                console.error("No address data found.");
            }
        });
    }
});

function setAddressValues(address, frm) {
    console.log("Setting address values:", address);
    frm.set_value('country', address.country || '');
    frm.set_value('address_title', address.address_line1 || '');
    frm.set_value('city', address.city || '');
    frm.set_value('state', address.state || '');
    frm.set_value('county', address.county || '');
    frm.set_value('pincode', address.postcode || '');
    frm.set_value('address_line1', address.address_line1 || '');
    frm.set_value('address_line2', address.formatted || '');
    frm.set_value('custom_timezone', address.timezone || '');
    frm.set_value('custom_bbox_lat1', address.bbox ? address.bbox.lat1 || '' : '');
    frm.set_value('custom_bbox_lon1', address.bbox ? address.bbox.lon1 || '' : '');
    
}