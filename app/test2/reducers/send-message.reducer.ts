import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
  ProductTypeElement,
} from "@clockworklabs/spacetimedb-sdk";

export type SendMessage = {
  text: string;
};

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([
    new ProductTypeElement("text", AlgebraicType.createStringType()),
  ]);
}

function serialize(writer: BinaryWriter, value: SendMessage): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): SendMessage {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const sendMessage = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};
