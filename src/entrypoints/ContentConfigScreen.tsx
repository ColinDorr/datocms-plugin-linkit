import React, { useState } from 'react';
import { Canvas, Form, FieldGroup, SelectField, SwitchField, TextField } from "datocms-react-ui";
import Log from "./../utils/develop";
import Helpers from "./../utils/helpers";
import styles from "./styles/styles.ContentConfigScreen.module.css";

import FieldAsset from "./../components/fields/FieldAsset";
import FieldRecord from "./../components/fields/FieldRecord";
import FieldTel from "./../components/fields/FieldTel";
import FieldEmail from "./../components/fields/FieldEmail";
import FieldUrl from "./../components/fields/FieldUrl";
import internal from 'stream';

const { getCtxParams, getDefaultValue } = Helpers();

type PropTypes = {
  ctx: any;
};

type LinkType = { label: string, api_key?: string, value: string };
type StylingType = { label: string, value: string };

type ContentSettings = {
    linkType: LinkType, 
    record: any, 
    asset: any, 
    url: any, 
    tel: any, 
    email: any, 
    stylingType: StylingType, 
    custom_text: string,
    open_in_new_window: boolean
 };

export default function ContentConigScreen({ ctx }: PropTypes) {
    // Retrieve parameters from context
    const ctxFieldParameters: any = getCtxParams(ctx, "field_settings");
    const ctxPluginParameters: any = getCtxParams(ctx, "plugin_settings");
    const ctxParameters: any = getCtxParams(ctx, "content_settings");

    // List field settings data
    const itemTypes = ctxFieldParameters.itemTypes || ctxPluginParameters.itemTypes || [];
    let linkTypeOptions: LinkType[] = ctxFieldParameters?.linkTypeOptions || []; // record, assets, url, mail, tel

    if( itemTypes.length === 0) {
        linkTypeOptions = linkTypeOptions.filter(e => e.value !== "record")
    }

    const locale: string = ctx?.locale;
    const defaultLinkType = { label: "--select--", value: "", api_key: "" };
    const stylingOptions = ctxFieldParameters?.stylingOptions || []

    const allowNewTarget = ctxFieldParameters?.allow_new_target || true;
    const allowCustomText = ctxFieldParameters?.allow_custom_text || true;

    const defaultRecord = { "id": null,  "title": null,  "cms_url": null, "slug": null, "status": null,  "url": null };
    const defaultAsset = { "id": null,  "title": null,  "cms_url": null, "slug": null, "status": null,  "url": null };
    const defaultUrl = { "title": null, "url": null };
    const defaultTel = { "title": null, "url": null };
    const defaultEmail = { "title": null, "url": null };
    const defaultResult = { "text": null, "url": null, "target": null, internal: null }

    const savedContentSettings: ContentSettings = {
        linkType: getDefaultValue(ctxParameters, "linkType", linkTypeOptions?.[0] || defaultLinkType ), 
        record: getDefaultValue(ctxParameters, "record", defaultRecord ), 
        asset: getDefaultValue(ctxParameters, "asset", defaultAsset ), 
        url: getDefaultValue(ctxParameters, "url", defaultUrl ), 
        tel: getDefaultValue(ctxParameters, "tel", defaultTel ), 
        email: getDefaultValue(ctxParameters, "email", defaultEmail ),  
        stylingType: getDefaultValue(ctxParameters, "stylingType", stylingOptions?.[0] || "" ), 
        custom_text: getDefaultValue(ctxParameters, "custom_text", "" ),
        open_in_new_window: getDefaultValue(ctxParameters, "open_in_new_window", false )
    };
    const [contentSettings, setContentSettings] = useState<ContentSettings>(savedContentSettings);

    // // Function to update content settings
    console.log({savedContentSettings})
    const updateContentSettings = async ( valueObject: object ) => {
        
        const data = {
            ...contentSettings,
            ...valueObject
        } as any;
      
        const selectedType: string = data.linkType.value;
        const formatted = {
            isValid: false,
            text: data?.custom_text || data?.[selectedType]?.title || null,
            url: data?.[selectedType]?.url || null,
            target: data?.open_in_new_window ? '_blank' : '_self',
            internal: selectedType === 'record'
        };
        formatted.isValid = formatted.text && formatted.url;

        const newSettings = {
            ...data, 
            formatted
        }

        setContentSettings(newSettings);

        ctx.setFieldValue(ctx.fieldPath, JSON.stringify(newSettings) );

        Log({
            call : "updateContentSettings",
            newSettings,
            ctx
        });
    }

    return (
        <Canvas ctx={ctx}>
            {contentSettings.linkType?.value ? (
                <Form className={ styles.linkit } onSubmit={() => console.log("onSubmit")}>
                    <FieldGroup className={ styles.linkit__column }>
                        <SelectField
                            name="type"
                            id="type"
                            label="Type"
                            value={ contentSettings.linkType }
                            selectInputProps={{
                                options: linkTypeOptions as LinkType[],
                            }}
                            onChange={(newValue) => {
                                updateContentSettings({"linkType": newValue})
                            }}
                        />
                        {stylingOptions && stylingOptions.length > 0 && (
                            <SelectField
                                name="styling"
                                id="styling"
                                label="Styling"
                                value={ contentSettings.stylingType }
                                selectInputProps={{
                                    options: stylingOptions as StylingType[],
                                }}
                                onChange={(newValue) => {
                                    updateContentSettings({"stylingType": newValue})
                                }}
                            />
                        )}
                    </FieldGroup>
                    <FieldGroup className={ styles.linkit__column }>
                        {contentSettings.linkType.value === "record" ? (
                            <FieldRecord
                                ctx={ctx} 
                                ctxFieldParameters={ctxFieldParameters}
                                ctxPluginParameters={ctxPluginParameters}
                                savedFieldSettings={contentSettings.record}
                                onValueUpdate={(value: any) => updateContentSettings({"record": value})}
                                locale={locale} 
                            />                          
                        ) : contentSettings?.linkType?.value === "asset" ? (
                            // <p>asset</p>
                            <FieldAsset 
                                ctx={ctx} 
                                savedFieldSettings={contentSettings.asset}
                                onValueUpdate={(value: any) => updateContentSettings({"asset": value})}
                                locale={locale} 
                            />
                            
                        ) : contentSettings?.linkType?.value === "url" ? (
                            <FieldUrl
                                ctx={ctx} 
                                savedFieldSettings={contentSettings.url}
                                onValueUpdate={(value: any) => updateContentSettings({"url": value})}
                            />
                        ) : contentSettings?.linkType?.value === "tel" ? (
                            <FieldTel
                                ctx={ctx} 
                                savedFieldSettings={contentSettings.tel}
                                onValueUpdate={(value: any) => updateContentSettings({"tel": value})}
                            />
                        ) : contentSettings?.linkType?.value === "email" ? (
                            <FieldEmail
                                ctx={ctx} 
                                savedFieldSettings={contentSettings.email}
                                onValueUpdate={(value: any) => updateContentSettings({"email": value})}
                            />
                        ) : null }
                        { allowCustomText && (
                            <TextField
                                name="custom_text"
                                id="custom_text"
                                label="Custom text (Optional)"
                                value={ contentSettings.custom_text }
                                textInputProps={{ monospaced: true }}
                                onChange={(newValue) => {
                                    updateContentSettings({"custom_text": newValue})
                                }}
                            />
                        )}
                    </FieldGroup>
                    <FieldGroup className={ styles.linkit__column_top }>
                        { allowNewTarget && (
                            <SwitchField
                                name="open_in_new_window"
                                id="open_in_new_window"
                                label="Open in new window"
                                value={ contentSettings.open_in_new_window }
                                onChange={(newValue) => {
                                    contentSettings.open_in_new_window = newValue
                                    updateContentSettings({"open_in_new_window": newValue})
                                }}
                            />
                        )} 
                    </FieldGroup>
                </Form>
            ) : (
                <div>
                    <p><strong>Error!</strong><br/>No valid link types could be found for this field.<br/>Please add the wanted link types to the field appearence settings or the plugin settings</p>
                </div>
            )}
        </Canvas>
    );
}
