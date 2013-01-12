
/*
 * A general superclass for nodes on the Pedigree graph. Contains connections
 * and basic information about gender, ID and a graphics element.
 *
 * @param x the x coordinate on the canvas
 * @param x the y coordinate on the canvas
 * @param gender should be "U", "F", or "M" depending on the gender
 * @param id the unique ID number of this node
 */

var AbstractPerson = Class.create(AbstractNode, {

    initialize: function($super, x, y, gender, id) {
        this._partnershipNodes = [];
        this._gender = this.parseGender(gender);
        this._parentPregnancy = null;
        $super(x, y, id);
        this._type = "AbstractPerson"
      },

    /*
     * Initializes the object responsible for creating graphics for this node
     *
     * @param x the x coordinate on the canvas at which the node is centered
     * @param y the y coordinate on the canvas at which the node is centered
     */
    generateGraphics: function(x, y) {
        return new AbstractPersonVisuals(this, x, y);
    },

    /*
     * Returns a Partnership containing the parent nodes
     */
    getParentPartnership: function() {
        var preg = this.getParentPregnancy();
        if(preg) {
            return preg.getPartnership();
        }
        return null;
    },

    /*
     * Replaces the parents Partnership with the one passed in the parameter
     *
     * @param partnership is a Partnership object that should have this node listed as a child
     */
    setParentPartnership: function(partnership) {
        this._parentPartnership = partnership;
    },

    /*
     * Returns the Pregnancy associated with this node
     */
    getParentPregnancy: function() {
        return this._parentPregnancy;
    },

    /*
     * Replaces the the Pregnancy associated with this node with the one passed in the parameter
     *
     * @param pregnancy a Pregnancy object that has this node listed as a child
     */
    setParentPregnancy: function(pregnancy) {
            this._parentPregnancy = pregnancy;
    },

    /*
     * Returns an array containing the two parents of this node.
     */
    getParents: function() {
        if(this.getParentPartnership()){
            return [this.getParentPartnership().getPartners()[0], this.getParentPartnership().getPartners()[1]]
        }
        return null;
    },

    /*
     * Returns true if this node is a descendant of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isDescendantOf: function(otherNode) {
        if(otherNode.isParentOf(this)) {
            return true;
        }
        else {
            var found = false,
                children = otherNode.getChildren(),
                i = 0;
            while((i < children.length) && !found) {
                found = this.isDescendantOf(children[i]);
                i++;
            }
            return found;
        }
    },

    /*
     * Reads a string of input and converts it into the standard gender format of "M","F" or "U".
     * Defaults to "U" if string is not recognized
     *
     * @param gender the string to be parsed
     */
    parseGender: function(gender) {
        return (gender == 'M' || gender == 'F')?gender:'U';
    },

    /*
     * Returns "U", "F" or "M" depending on the gender of this node
     */
    getGender: function() {
        return this._gender;
    },

    /*
     * Updates the gender of this node and (optionally) updates the
     * graphics. Updates gender of all partners if it is unknown.
     * Returns an array of nodes visited during the partner traversal.
     *
     * @param gender should be "U", "F", or "M" depending on the gender
     * @param forceDraw set to true if you want to update the graphics
     * @param visitedNodes an array of nodes that were visited during the traversal up until
     *  this node. OMIT this parameter. It is used for internal functionality.
     */
    setGender: function(gender, visitedNodes) {
        var visited = (visitedNodes instanceof Array) ? visitedNodes : [];
        visited.push(this);
        if(!this.getParentPregnancy()  || !this.getParentPregnancy().isGenderLocked()) {
            if(this.getPartners().length == 0) {
                this._gender = this.parseGender(gender);
                this.getGraphics().setGenderSymbol();
                this.getParentPregnancy() && this.getParentPregnancy().setGender(gender);
            }
            else if(this.getGender() == "U") {
                var me = this;
                this._gender = this.parseGender(gender);
                this.getGraphics().setGenderSymbol();
                this.getPartners().each(function(partner) {
                    if(visited.indexOf(partner) == -1) {
                        visited = partner.setGender(me.getOppositeGender(), visited);
                    }
                });
                this.getParentPregnancy() && this.getParentPregnancy().setGender(gender);
            }
        }
        return visited;
    },

    /*
     * Returns an array of Partnership objects of this node
     */
    getPartnerships: function() {
        return this._partnershipNodes;
    },

    /*
     * Returns the Partnership affiliated with partner
     *
     * @partner can be a Person or a PlaceHolder
     */
    getPartnership: function(partner) {
        if(partner) {
            var partnerships = this.getPartnerships();
            for(var i = 0; i < partnerships.length; i++) {
                if(partnerships[i].getPartnerOf(this).getID() == partner.getID()) {
                    return partnerships[i];
                }
            }
        }
        return null;
    },

    /*
     * Returns an array nodes that share a Partnership with this node
     */
    getPartners: function() {
        var partners = [];
        var me = this;
        this.getPartnerships().each(function(partnership) {
            var partner = partnership.getPartnerOf(me);
            partner && partners.push(partner);
        });
        return partners;
    },

    /*
     * Adds a new partnership to the list of partnerships of this node
     *
     * @param partnership is a Partnership object with this node as one of the partners
     */
    addPartnership: function(partnership) {
       if(this.getPartners().indexOf(partnership.getPartnerOf(this)) == -1) {
           this._partnershipNodes.push(partnership);
       }
    },

    /*
     * Removes a partnership from the list of partnerships
     *
     * @param partnership is a Partnership object with this node as one of the partners
     */
    removePartnership: function(partnership) {
        if(partnership) {
            var target = null;
            this._partnershipNodes.each(function(p) {
                if(p.getID() == partnership.getID())
                    target = p;
            });
            if(target)
                this._partnershipNodes = this._partnershipNodes.without(target);
        }
    },

    /*
     * Creates a Partnership of two new Person nodes of opposite gender, and sets parents to this partnership
     */
    createParents: function() {
        if(this.getParentPartnership() == null) {
            var positions = editor.findPosition ({above : this.getID()}, ['mom', 'dad']);
            var mother = editor.getGraph().addPerson(positions['mom'].x, positions['mom'].y, "F", false),
                father = editor.getGraph().addPerson(positions['dad'].x, positions['dad'].y, "M", false);

            var joinPosition = editor.findPosition({join : [mother.getID(), father.getID()]});
            var partnership = editor.getGraph().addPartnership(joinPosition.x, joinPosition.y, mother, father);
            
            //document.fire('pedigree:parents:added', {'node' : partnership, 'relatedNodes' : [mother, father], 'sourceNode' : this});
            return this.addParents(partnership);
        }
    },

    /*
     * Sets parents to the partnership passed in the parameter, and adds this node to partnership's list of children
     *
     * @param partnership is a Partnership node.
     */
    addParents: function(partnership) {
        if(this.getParentPartnership() == null) {
            partnership.addChild(this);
        }
        return partnership;
    },
    /*
     * Sets this node as a child of a new partnership between parent and a new placeholder.
     *
     * @param parent is an AbstractPerson.
     */
    addParent: function(parent) {
        if(parent.canBeParentOf(this)) {
            var partnership = parent.createPartner(true, true);
            partnership.addChild(this);
            return partnership;
        }
    },

    /*
     * Returns a string representing the opposite gender of this node ("M" or "F"). Returns "U"
     * if the gender of this node is unknown
     */
    getOppositeGender : function() {
        if (this.getGender() == "U") {
            return "U";
        }
        else if(this.getGender() == "M") {
            return "F";
        }
        else {
            return "M";
        }
    },
    /*
     * Creates a new node and generates a Partnership with this node.
     * Returns the Partnership.
     *
     * @param isPlaceHolder set to true if the new partner should be a PlaceHolder
     */
    createPartner: function(isPlaceHolder, noChild) {
        var pos = editor.findPosition({side: this.getID()}),
            gen = this.getOppositeGender(),
            partner = (isPlaceHolder) ? editor.getGraph().addPlaceHolder(pos.x, pos.y, gen) : editor.getGraph().addPerson(pos.x, pos.y, gen);
        var result = this.addPartner(partner, noChild);
        document.fire('pedigree:partner:added', {'node' : partner, 'relatedNodes' : [result], 'sourceNode' : this});
        return result;
    },

    /*
     * Creates a new Partnership with the partner passed in the parameter.
     * Does not duplicate a partnership if one already exists.
     * Returns the new Partnership or the preexisting partnership
     *
     * @param partner a Person or PlaceHolder.
     */
    addPartner: function(partner, noChild) {
        if(this.getPartners().indexOf(partner) != -1){
            return this.getPartnership(partner);
        }
        else if(this.canPartnerWith(partner)) {
            var joinPosition = editor.findPosition({join : [this.getID(), partner.getID()]});
            var partnership = editor.getGraph().addPartnership(joinPosition.x, joinPosition.y, this, partner);

            if(this.getGender() == 'U' && partner.getGender() != 'U') {
                this.setGender(partner.getOppositeGender());
            }
            else if(this.getGender() != 'U' && partner.getGender() == 'U') {
                partner.setGender(this.getOppositeGender());
            }

            if(partnership.getChildren().length == 0 &&
                                            !noChild &&
                                            !(this.getChildlessStatus && this.getChildlessStatus()) &&
                                            !(partner.getChildlessStatus && partner.getChildlessStatus())) {
                partnership.createChild("PlaceHolder", "U", 1);
            }
            
            document.fire('pedigree:partnership:added', {
                'node' : partnership,
                'relatedNodes' : [partner],
                'sourceNode' : this
            });
            return partnership;
        }
    },

    /*
     * Returns an array of nodes that are children from all of this node's Partnerships.
     * The array can include PlaceHolders.
     *
     * @param type can be "Person", "PersonGroup" or "PlaceHolder".
     * Multiple types can be passed (eg. getChildren(type1, type2,...,typeN)
     */
    getChildren: function(type) {
        var args = arguments;
        var children = [];
        this.getPartnerships().each(function(partnership) {
            children = children.concat(partnership.getChildren.apply(partnership, args));
        });
        return children;
    },

    /*
     * Returns true if this person is a parent of non-placeholder children.
     */
    hasChildren: function() {
        return this.getChildren("Person").concat(this.getChildren("PersonGroup")).length > 0;
    },

    /*
     * Creates node of type nodeType and gender nodeGender and a partnership with a new placeholder. Sets
     * the child as a child of this partnership.
     *
     * @param nodeType the type for the new child. (eg. "Person", "PlaceHolder", "PersonGroup")
     * @param nodeGender can be "M", "F" or "U".
     */
    createChild: function(nodeType, nodeGender) {
        return this.createPartner(true, true).createChild(nodeType, nodeGender);
    },

    /*
     * Creates a partnership with a new placeholder node and adds childNode to as a child of this partnership.
     *
     * @param childNode is an AbstractPerson
     */
    addChild: function(childNode) {
        if(this.canBeParentOf(childNode)) {
            var partnership = this.createPartner(true, true);
            partnership.addChild(childNode);
            return childNode;
        }
        return null;
    },

    /*
     * Returns all the nodes that come from the same pregnancy.
     *
     * @param type the type for the new child. (eg. "Person", "PlaceHolder", "PersonGroup")
     */
    getTwins: function(type) {
        return this.getParentPregnancy().getChildren(type).without(this);
    },

    /*
     * Returns true if this node is a parent of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isParentOf: function(otherNode) {
        return (this.getChildren().indexOf(otherNode) > -1);
    },

    /*
     * Returns true if this node is an ancestor of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isAncestorOf: function(otherNode) {
        return otherNode.isDescendantOf(this);
    },

    /*
     * Returns true if this node is a partner of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isPartnerOf: function(otherNode) {
        if(otherNode) {
            for(var i = 0; i < this.getPartners().length; i++) {
                if(this.getPartners()[i].getID() == otherNode.getID())
                    return true;
            }
        }
        return false;
    },

    /*
     * Returns true if this node can have a heterosexual Partnership with otherNode
     *
     * @param otherNode is a Person
     */
    canPartnerWith: function(otherNode) {
        var oppositeGender = (this.getOppositeGender() == otherNode.getGender() || this.getGender() == "U"
                                                                                || otherNode.getGender() == "U");
        var numSteps = this.getStepsToNode(otherNode)[0];
        var oddStepsAway = (numSteps == null || numSteps%2 == 1);
        return oppositeGender && oddStepsAway;
    },

    /*
     * Returns true if this node can be a parent of otherNode
     *
     * @param otherNode is a Person
     */
    canBeParentOf: function(otherNode) {
        var isDescendant = this.isDescendantOf(otherNode);
        return (this != otherNode) &&
            otherNode.getParentPartnership() == null &&
            this.getChildren().indexOf(otherNode) == -1 &&
            !isDescendant;
    },

    /*
     * Breaks connections with all related nodes and removes this node from
     * the record.
     * (Optional) Removes all descendant nodes and their relatives that will become unrelated to the proband as a result
     *
     * @param isRecursive set to true if you want to remove all unrelated descendants as well
     */
    remove: function($super, isRecursive) {
        if(isRecursive) {
            $super(true)
        }
        else {
            this.getPartnerships().each(function(partnership) {
                partnership.remove(false);
            });
            var parentPregnancy = this.getParentPregnancy();
            parentPregnancy && parentPregnancy.removeChild(this);
            this.getGraphics().remove();
            $super(isRecursive);
        }
    },

    /*
     * Returns all of this node's Partnerships
     */
    getSideNeighbors: function() {
        return this.getPartnerships();
    },

    /*
     * Returns an array with the number of partnerships between this node and otherNode, and the nodes visited
     * in the process of the traversal
     *
     * @param otherNode an AbstractNode whose distance (in partnerships) from this node you're trying to calculate
     * @param visitedNodes an array of nodes that were visited in the result of the traversal. This parameter is used
     * internally so omit it when calling the function
     */
    getStepsToNode: function(otherNode, visitedNodes) {
        var visited = (visitedNodes) ? visitedNodes : [];
        visited.push(this);
        if(this === otherNode) {
            return [0, visited];
        }
        else {
            var numSteps = null;
            this.getPartners().each(function(partner) {
                if(visited.indexOf(partner) == -1) {
                    numSteps = partner.getStepsToNode(otherNode, visited)[0];
                    if(numSteps != null) {
                        numSteps = 1 + numSteps;
                        throw $break;
                    }
                }
            });
            return [numSteps, visited];
        }
    },

    /*
     * Returns the parent's Partnership
     */
    getUpperNeighbors: function() {
        return this.getParentPregnancy() ? [this.getParentPregnancy()] : [];
    },

    /*
     * Returns an object containing information about this person.
     */
    getInfo: function($super) {
        var info = $super();
        info['gender'] = this.getGender();
        return info;
    },

    /*
     * Applies all the relevant information in info to this node
     *
     * @param info is an object containing information about this node. info.id should be the same as this node's id.
     */
    loadInfo: function($super, info) {
        if($super(info) && info.gender) {
            if(this.getGender() != info.gender)
                this.setGender(info.gender, null);
            return true;
        }
        return false;
    }
});