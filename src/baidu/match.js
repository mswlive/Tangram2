///import baidu.type;
///import baidu.query;
///import baidu.each;
///import baidu.merge;
///import baidu.unique;

/**
 * @fileoverview
 * @name baidu.match
 * @author meizz
 * @create 2012-06-18
 * @modify
 */

/**
 * 对 TangramDom 里的所有元素进行筛选匹配，返回匹配上的DOM元素数组
 * @grammer TangramDom.match(selector)
 * @grammer TangramDom.match(tangramDom)
 * @grammer TangramDom.match(HTMLElement)
 * @grammer TangramDom.match(fn(index))
 * @param   {String}        selector    CSS选择器
 * @return  {Array}         Array
 */
baidu.match = function(){
    var reg = /^[\w\#\-\$\.\*]+$/,

        // 使用这个临时的 div 作为CSS选择器过滤
        div = document.createElement("DIV");
        div.id = "__tangram__";

    return function(array, selector){
        var root, results = [];

        switch (baidu.type(selector)) {
            // 取两个 TangramDom 的交集
            case "$DOM" :
                for (var x=array.length-1; x>-1; x--) {
                    for (var y=selector.length-1; y>-1; y--) {
                        array[x] === selector[y] && results.push(array[x]);
                    }
                }
                break;

            // 使用过滤器函数，函数返回值是 Array
            case "function" :
                baidu.each(array, function(item, index){
                    selector.call(item, index) && results.push(item);
                });
                break;
            
            case "HTMLElement" :
                baidu.each(array, function(item){
                    item == selector && results.push(item);
                });
                break;

            // CSS 选择器
            case "string" :
                baidu.each(array, function(item){
                    // in DocumentFragment
                    root = getRoot(item); 
                    if (root.nodeType == 1) {
                        div.appendChild(item);
                        baidu.merge(results, baidu.query(selector, div));
                        div.innerHTML = "";
                    } else {
                        baidu.merge(results, baidu.query(selector, document));
                    }
                });
                results = baidu.unique(results);
                break;
        }
        return results;

    };

    function getRoot(dom) {
        var result = [], i;

        while(dom = dom.parentNode) {
            result.push(dom);
        }

        for (var i=result.length - 1; i>-1; i--) {
            // 1. in DocumentFragment
            // 9. Document
            if (result[i].nodeType == 1 || result[i].nodeType == 9) {
                return result[i];
            }
        }
        return null;
    }
}();
