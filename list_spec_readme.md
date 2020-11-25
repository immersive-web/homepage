# ReadMe for List of specifications

## Configuration

Following edits are required:

* `list_spec.html` has JavaScript list object named as `list_groups` for list of group IDs
* Edit `list_spec.html` for title lines (e.g. `h1`)
* Edit `list_spec.json` following data format

## Data format

JSON file `list_spec.json` is organized as following format:

``` js
{
  "spec name by github repository like 'immersive-web/webxr'": [ // list of levels
    {
      "level": 1, // number of level
      "events":[ //list of events, for transition
        {
          "target": "name of transition", // like "fpwd", "cr", etc.
          "date": "date of publish",
          "cfc": "URL for CfC on transition", // normally mail list archive
          "resolution": "URL for resolution of CfC on transition",
          "transition": "URL of github issue on w3c/transitions repository",
          "pre": { // list of pre process items before transition
            // this include early stage ones (e.g. early TAG review as pre-FPWD)
            "summary": "URL" // will be shown as link
            // see below for list of possible keywords
          }, 
          "post": { // list of post process items after transition
            // same as 'pre'
          }
        },
        { // continue for other transitions
        }
      ]
    },
    { // continue for information of another level
    }
  ] ,
  "second spec name": [
    // same as first
  ]
}
```
### list of possible keywords for `pre` and `post`

* summary: github issue of tracker for summary of pre/post processes (e.g. HR, announce)
* Horizontal reviews
  * tag
  * a11y
  * i18n
  * privacy
  * security
* wbs: WBS for W3C-wide review (assuming only AC review after PR)
* news: post to `w3.org/blog/news` on publication
* cfw: Call for Exclusion (patent policy)


TBD for external groups including liaisons

