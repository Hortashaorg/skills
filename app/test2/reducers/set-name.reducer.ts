import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
  ProductTypeElement,
} from "@clockworklabs/spacetimedb-sdk";

export type SetName = {
  name: string;
};

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([
    new ProductTypeElement("name", AlgebraicType.createStringType()),
  ]);
}

function serialize(writer: BinaryWriter, value: SetName): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): SetName {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const setName = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};
