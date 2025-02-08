import { VisibilityTypeClass } from "./CanvasBox";
import { VisibilityTypeAttributes, RelationshipType } from "./CanvasBoxAtributes";
import Service from "./Services";
import { TypeAttbutesTypeOrm } from "./TypeAttributesTypeOrm";

export interface  Project {
  id: string;
  name: string;
  services?: Service[];
}
export const  FakeProject = {
      id: "0a01",
      name: "MonkataRH",
      services: [
        {
          id: "0a02",
          name: "Payroll",
          canvasBoxes: [
            {
              id: "0a03",
              entityName: "Employee",
              createdBy: "John Doe",
              updatedBy: "John Doe",
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
              createdBy: "John Doe",
              updatedBy: "John Doe",
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
                  isMapped: true
                },
                {
                  name: "Employee",
                  type: "0a03",
                  id: '3',
                  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                  isMapped: false,
                  relation: {
                    type: RelationshipType.MANY_TO_ONE,
                    targetEntity: "0a03",
                    targetEntityAttribute: "3"
                  }
                }
              ],
              visibility: VisibilityTypeClass.PUBLIC
            }
          ]
        },

        {
          id: "0a03",
          name: "Attendance",
          canvasBoxes: [
            {
              id: "0a03",
              entityName: "Employee",
              createdBy: "John Doe",
              updatedBy: "John Doe",
              attributes: [
                {
                  name: "id",
                  type: TypeAttbutesTypeOrm.UUID,
                  id: '1',
                  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                  isMapped: false
                },
                {
                  name: "age",
                  type: TypeAttbutesTypeOrm.INT,
                  id: '2',
                  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                  isMapped: false
                },
                {
                  name: "adresses",
                  type: "0a04",
                  id: '3',
                  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                  isMapped: true,
                  relation: {
                    type: RelationshipType.ONE_TO_MANY,
                    targetEntity: "0a04",
                    targetEntityAttribute: "3"
                  }
                },
                {
                  name: "lastName",
                  type: TypeAttbutesTypeOrm.VARCHAR,
                  id: '4',
                  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                  isMapped: false
                },
              ],
              visibility: VisibilityTypeClass.PUBLIC
            },

          ]
        }

      ]
    };
