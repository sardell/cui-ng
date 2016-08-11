# CUI-Resize-Handler

### Description
Use the `cui-resize-handler` directive and `$cuiResizeHandlerProvider` together when you need DOM elements inserted/removed based on screen size.

### Setup

* The global breakpoint is set in the appConfig.json with `"breakpointOption": 700` where 700 would be your breakpoint between desktop and mobile
	* Mobile is less than the `Break Point Number`
	* Desktop is greater than or equal to the `Break Point Number` 

### Usage Examples

#### Config Example

```
<cui-resize-handler mobile show-if="directive.mobileElement">
	<p>This will show on mobile size only</p>
</cui-resize-handler>
```

```
<cui-resize-handler desktop show-if="directive.desktopElement">
	<p>This will show on desktop size only</p>
</cui-resize-handler>
```

#### Custom Breakpoint Example

```
<cui-resize-handler mobile breakpoint="1000" show-if="directive.customMobile">
	<p>This will show while the screen is smaller than the specified breakpoint</p>
</cui-resize-handler>
```

```
<cui-resize-handler desktop breakpoint="1000" show-if="directive.customDesktop">
	<p>This will show while the screen is bigger than or equal to the specified breakpoint</p>
</cui-resize-handler>
```

### Optional Attributes

* `breakpoint`: Given a number, this will overwrite the breakpoint specified in the config
