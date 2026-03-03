# Conversion Event Verification

Date: 2026-03-03T21:18:02.141Z

Status: PASS
Target: http://127.0.0.1:56523/
Mode: local static server

Required base events:
- app_store_click
- demo_chip_click
- waitlist_submit_start
- waitlist_submit_success
- waitlist_submit_error
- tips_popup_open
- tips_popup_dismiss

Required flow events:
- waitlist_submit_start (surface=hero_waitlist)
- waitlist_submit_error (surface=hero_waitlist)
- waitlist_submit_success (surface=hero_waitlist)
- waitlist_submit_start (surface=blog_hub_waitlist)
- waitlist_submit_error (surface=blog_hub_waitlist)
- waitlist_submit_success (surface=blog_hub_waitlist)
- waitlist_submit_start (surface=messages_hub_waitlist)
- waitlist_submit_error (surface=messages_hub_waitlist)
- waitlist_submit_success (surface=messages_hub_waitlist)
- tips_popup_open (surface=tips_popup)
- tips_popup_dismiss (surface=tips_popup)
- waitlist_submit_start (surface=tips_popup)
- waitlist_submit_error (surface=tips_popup)
- waitlist_submit_success (surface=tips_popup)

Captured calls: 23
Captured normalized events: 23
Hero flow events captured: 4
Blog hub flow events captured: 4
Messages hub flow events captured: 4
Popup flow events captured: 8
- experiment_exposure {}
- app_store_click {"location":"hero_primary"}
- demo_chip_click {"variant":"birthday"}
- waitlist_submit_start {"surface":"hero_waitlist"}
- waitlist_submit_error {"surface":"hero_waitlist"}
- waitlist_submit_start {"surface":"hero_waitlist"}
- waitlist_submit_success {"surface":"hero_waitlist"}
- tips_popup_open {"surface":"tips_popup","trigger":"exit_intent"}
- tips_popup_dismiss {"surface":"tips_popup","reason":"dismiss_button"}
- tips_popup_open {"surface":"tips_popup","trigger":"exit_intent"}
- waitlist_submit_start {"surface":"tips_popup"}
- waitlist_submit_error {"surface":"tips_popup"}
- waitlist_submit_start {"surface":"tips_popup"}
- waitlist_submit_success {"surface":"tips_popup"}
- tips_popup_dismiss {"surface":"tips_popup","reason":"submit_success"}
- waitlist_submit_start {"surface":"messages_hub_waitlist"}
- waitlist_submit_error {"surface":"messages_hub_waitlist"}
- waitlist_submit_start {"surface":"messages_hub_waitlist"}
- waitlist_submit_success {"surface":"messages_hub_waitlist"}
- waitlist_submit_start {"surface":"blog_hub_waitlist"}
- waitlist_submit_error {"surface":"blog_hub_waitlist"}
- waitlist_submit_start {"surface":"blog_hub_waitlist"}
- waitlist_submit_success {"surface":"blog_hub_waitlist"}
