/*
 * A general superclass for the a graphic engine used by nodes on the Pedigree graph. Can display
 * a shape representing the gender of the attached node.
 *
 * @param node the AbstractPerson object for which this graphics are handled
 * @param x the x coordinate on the canvas
 * @param x the y coordinate on the canvas
 */

var PersonGroupVisuals = Class.create(AbstractPersonVisuals, {

    initialize: function($super, node, x, y) {
        $super(node,x,y);
        this.label = editor.getPaper().text(x, y, "n").attr(PedigreeEditor.attributes.descendantGroupLabel);
        this.label.insertAfter(this._icon.flatten());
        this._icon.push(this.label);
        this._hoverBox = new GroupHoverbox(node, x, y, this._icon);
    },

    getAllGraphics: function ($super) {
        return this.getHoverBox().getBackElements().concat($super()).push(this.getHoverBox().getFrontElements());
    },

    setNumPersons: function(numPersons) {
        this._icon.pop();
        this.label.remove();
        var text = (numPersons && numPersons > 1) ? String(numPersons) : "n";
        this.label = editor.getPaper().text(this.getX(), this.getY(), text).attr(PedigreeEditor.attributes.descendantGroupLabel);
        this._icon.push(this.label);
    }
});