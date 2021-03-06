// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt




frappe.provide("erpnext");

frappe.ui.form.on("Customer", {
	setup: function(frm) {
		frm.add_fetch('lead_name', 'company_name', 'customer_name');
		frm.add_fetch('default_sales_partner','commission_rate','default_commission_rate');

		frm.set_query('customer_group', {'is_group': 0});
		frm.set_query('default_price_list', { 'selling': 1});
		frm.set_query('account', 'accounts', function(doc, cdt, cdn) {
			var d  = locals[cdt][cdn];
			var filters = {
				'account_type': 'Receivable',
				'company': d.company,
				"is_group": 0
			};

			if(doc.party_account_currency) {
				$.extend(filters, {"account_currency": doc.party_account_currency});
			}

			return {
				filters: filters
			}
		});
	},
	refresh: function(frm) {
		if(frappe.defaults.get_default("cust_master_name")!="Naming Series") {
			frm.toggle_display("naming_series", false);
		} else {
			erpnext.toggle_naming_series();
		}

		frappe.dynamic_link = {doc: frm.doc, fieldname: 'name', doctype: 'Customer'}

		frm.toggle_display(['address_html','contact_html'], !frm.doc.__islocal);

	
		if(!frm.doc.__islocal) {
			frappe.contacts.render_address_and_contact(frm);

			// custom buttons

			frm.add_custom_button(__('Call'), function() {
				console.log("_________")
				tn=frappe.model.make_new_doc_and_get_name('Call')
				locals['Call'][tn].customer=frm.doc.name;
				frappe.set_route('Form','Call',tn);
			});

			frm.add_custom_button(__('Appointment'), function() {
				tn=frappe.model.make_new_doc_and_get_name('Appointment')
				locals['Appointment'][tn].customer=frm.doc.name;
				frappe.set_route('Form','Appointment',tn);
			});

			frm.add_custom_button(__('Accounting Ledger'), function() {
				frappe.set_route('query-report', 'General Ledger',
					{party_type:'Customer', party:frm.doc.name});
			});

			frm.add_custom_button(__('Accounts Receivable'), function() {
				frappe.set_route('query-report', 'Accounts Receivable', {customer:frm.doc.name});
			});

			// indicator
			erpnext.utils.set_party_dashboard_indicators(frm);

		} else {
			frappe.contacts.clear_address_and_contact(frm);
		}

		var grid = cur_frm.get_field("sales_team").grid;
		grid.set_column_disp("allocated_amount", false);
		grid.set_column_disp("incentives", false);
	},
	validate: function(frm) {
		if(frm.doc.lead_name) frappe.model.clear_doc("Lead", frm.doc.lead_name);
	},
	

});

// this.create_call: function() {
// 		frappe.model.open_mapped_doc({
// 			method: "erpnext.crm.doctype.lead.lead.make_call",
// 			frm: cur_frm
// 		})
// 		console.log("_________")
// 	},

// 	create_appointment: function() {
// 		frappe.model.open_mapped_doc({
// 			method: "erpnext.crm.doctype.lead.lead.make_appointment",
// 			frm: cur_frm
// 		})
// 	},
