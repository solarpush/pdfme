/* eslint dot-notation: "off"*/
import { z } from 'zod';

const langs = ['en', 'ja', 'ar', 'th', 'pl', 'it'] as const;

export const Lang = z.enum(langs);

export const Size = z.object({ height: z.number(), width: z.number() });

export const Schema = z
  .object({
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    width: z.number(),
    height: z.number(),
    rotate: z.number().optional(),
  })
  .passthrough();

const SchemaForUIAdditionalInfo = z.object({
  id: z.string(),
  key: z.string(),
  data: z.string(),
});

export const SchemaForUI = Schema.merge(SchemaForUIAdditionalInfo);

const ArrayBufferSchema: z.ZodSchema<ArrayBuffer> = z.any().refine((v) => v instanceof ArrayBuffer);
const Uint8ArraySchema: z.ZodSchema<Uint8Array> = z.any().refine((v) => v instanceof Uint8Array);

export const Font = z.record(
  z.object({
    data: z.union([z.string(), ArrayBufferSchema, Uint8ArraySchema]),
    fallback: z.boolean().optional(),
    subset: z.boolean().optional(),
  })
);

export const BasePdf = z.union([z.string(), ArrayBufferSchema, Uint8ArraySchema]);

export const Template = z.object({
  schemas: z.array(z.record(Schema)),
  basePdf: BasePdf,
  sampledata: z.array(z.record(z.string())).length(1).optional(),
  columns: z.array(z.string()).optional(),
});

export const Inputs = z.array(z.record(z.string())).min(1);

const CommonOptions = z.object({ font: Font.optional() });

export const CommonProps = z.object({
  template: Template,
  options: CommonOptions.optional(),
  plugins: z.record(z.object({ ui: z.any(), pdf: z.any(), propPanel: z.any() })).optional(),
});

// -------------------generate-------------------

export const GeneratorOptions = CommonOptions;

export const GenerateProps = CommonProps.extend({
  inputs: Inputs,
  options: GeneratorOptions.optional(),
}).strict();

export const SchemaInputs = z.record(z.string());

// ---------------------------------------------

export const UIOptions = CommonOptions.extend({ lang: Lang.optional() });

const HTMLElementSchema: z.ZodSchema<HTMLElement> = z.any().refine((v) => v instanceof HTMLElement);

export const UIProps = CommonProps.extend({
  domContainer: HTMLElementSchema,
  options: UIOptions.optional(),
});

// -----------------Form, Viewer-----------------

export const PreviewProps = UIProps.extend({ inputs: Inputs }).strict();
export const PreviewReactProps = PreviewProps.omit({ domContainer: true }).extend({
  onChangeInput: z
    .function()
    .args(z.object({ index: z.number(), value: z.string(), key: z.string() }))
    .returns(z.void())
    .optional(),
  size: Size,
});

// ---------------Designer---------------

export const DesignerProps = UIProps.extend({}).strict();
export const DesignerReactProps = DesignerProps.omit({ domContainer: true }).extend({
  onSaveTemplate: z.function().args(Template).returns(z.void()),
  size: Size,
});
