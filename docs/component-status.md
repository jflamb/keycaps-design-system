# Component status

| Component | Status | Behavior foundation | Automated coverage |
| --- | --- | --- | --- |
| Button | Beta | React Aria Button | Accessible name, keyboard press, press/reduced-motion styling |
| Field | Beta | React Aria TextField | Label, description, error association, axe |
| Select | Beta | React Aria Select and ListBox | Keyboard open/typeahead/selection, accessible options, axe |
| Popover | Beta | React Aria Popover and DialogTrigger | Open, Escape close, focus return, reduced motion |
| Banner | Beta | Semantic HTML plus React Aria Button | Status/alert role, dismiss name and action |
| Badge | Beta | Semantic HTML | Text-preserved status tones |
| Card | Beta | Semantic HTML | Heading structure and composition |

The automated browser matrix covers Chromium, explicit light and dark themes, forced colors, reduced motion, and 320-CSS-pixel reflow. Stable status still requires documented VoiceOver/Safari and Windows screen-reader/browser verification.
