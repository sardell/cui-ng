angular.module('cui-ng')
.provider('$cuiResizeHandler', function() {

	const resizeProvider = {}
	const resizeHandlerFunctions = {}

	this.breakpoint = 700

	this.setHandler = (scopeId, handlerFunction, breakpoint) => {
		resizeHandlerFunctions[scopeId] = {
			handler: handlerFunction,
			breakpoint: breakpoint
		}
	}

	this.getHandler = (scopeId) => {
		return resizeHandlerFunctions[scopeId]
	}

	this.callHandlers = () => {
		for (let key in resizeHandlerFunctions) {
			resizeHandlerFunctions[key].handler(resizeHandlerFunctions[key].breakpoint)
		}
	}

	this.destroyElement = (scopeId) => {
		delete resizeHandlerFunctions[scopeId]
	}

	this.setBreakpoint = (breakpoint) => {
		this.breakpoint = breakpoint
	}

	this.getBreakpoint = () => {
		return this.breakpoint
	}

	this.$get = () => {
		return this
	}
})
