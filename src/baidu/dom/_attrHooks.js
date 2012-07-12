/**
 * @author wangxiao
 * @email  1988wangxiao@gmail.com
 */

///import baidu;
///import baidu.extend;
///import baidu.support;
///import baidu.dom;
///import baidu.dom._propHooks;

baidu.dom.rfocusable = /^(?:button|input|object|select|textarea)$/i,
baidu.dom.rtype = /^(?:button|input)$/i,
baidu.dom.rclickable = /^a(?:rea)?$/i;

baidu.extend(baidu,{
    _error : function( msg ) {
        throw new Error( msg );
    },
    _nodeName : function( elem, name ) {
        return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
    }    
});

baidu.extend(baidu.dom,{
	attrHooks: {
		type: {
			set: function( elem, value ) {
				var bd = baidu.dom;
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( bd.rtype.test( elem.nodeName ) && elem.parentNode ) {
					baidu._error( "type property can't be changed" );
				} else if ( !baidu.support.radioValue && value === "radio" && baidu._nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				var bd = baidu.dom;
				if ( bd.nodeHook && baidu._nodeName( elem, "button" ) ) {
					return bd.nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( bd.nodeHook && baidu._nodeName( elem, "button" ) ) {
					return bd.nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
baidu.dom.attrHooks.tabindex = baidu.dom.propHooks.tabIndex;

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !baidu.support.getSetAttribute ) {

	var bd = baidu.dom,
		fixSpecified = {
			name: true,
			id: true,
			coords: true
		};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	bd.nodeHook = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};

	// Apply the nodeHook to tabindex
	bd.attrHooks.tabindex.set = bd.nodeHook.set;

    // Set width and height to auto instead of 0 on empty string( Bug #8150 )
    // This is for removals
    baidu.each([ "width", "height" ], function( name,i ) {
        bd.attrHooks[ name ] = baidu.extend( bd.attrHooks[ name ], {
            set: function( elem, value ) {
                if ( value === "" ) {
                    elem.setAttribute( name, "auto" );
                    return value;
                }
            }
        });
    });

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	bd.attrHooks.contenteditable = {
		get: bd.nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			bd.nodeHook.set( elem, value, name );
		}
	};
};

// Some attributes require a special call on IE
if ( !baidu.support.hrefNormalized ) {
	var bd = baidu.dom;
    baidu.each([ "href", "src", "width", "height" ], function( name,i ) {
        bd.attrHooks[ name ] = baidu.extend( bd.attrHooks[ name ], {
            get: function( elem ) {
                var ret = elem.getAttribute( name, 2 );
                return ret === null ? undefined : ret;
            }
        });
    });
};

if ( !baidu.support.style ) {
	var bd = baidu.dom;
	bd.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
};
