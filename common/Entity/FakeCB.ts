import { RelationshipType, VisibilityTypeAttributes, VisibilityTypeClass } from "./CanvasBox";
import { TypeAttbutesTypeOrm } from "./TypeAttributesTypeOrm";

canvasBoxes: [
                {
                  id: "0a03",
                  entityName: "Employee",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    },
                    {
                      name: "lastName",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '4',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "firstName",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '5',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "adresses",
                      type: "0a04",
                      id: '3',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: true,
                      relation: {
                        type: RelationshipType.ONE_TO_MANY,
                        targetEntity: "0a04",
                        targetEntityAttribute: "3"
                      }
                    },
                    {
                      name: "email",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '6',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "password",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '7',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },

                    {
                      name: "age",
                      type: TypeAttbutesTypeOrm.INT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.PRIVATE,
                      isMapped: false
                    },


                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                },
                {
                  id: "0a04",
                  entityName: "Address",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: false
                    },
                    {
                      name: "city",
                      type: TypeAttbutesTypeOrm.INT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    },
                    {
                      name: "Employee",
                      type: "0a03",
                      id: '3',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: true,
                      relation: {
                        type: RelationshipType.MANY_TO_ONE,
                        targetEntity: "0a03",
                        targetEntityAttribute: "3"
                      }
                    }
                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                }
                ,
                {
                  id: "0a05",
                  entityName: "Users",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: false
                    },
                    {
                      name: "Username",
                      type: TypeAttbutesTypeOrm.TEXT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    },
                    {
                      name: "Password",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '3',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    }
                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                }
]