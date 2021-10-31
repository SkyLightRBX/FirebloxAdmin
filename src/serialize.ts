/*!
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * This file has been modified to support Luau Objects
 *
 * Luau is a trademark of Roblox
*/

/**
   * Encodes a JavaScript value into the Firestore 'Value' representation.
   *
   * @private
   * @internal
   * @param val The object to encode
   * @returns The Firestore Proto or undefined if we are deleting a field.
   */
export function encodeValue(val: unknown): IValue | undefined {

    if (typeIs(val, 'string')) {
        return {
            stringValue: val as string,
        };
    }

    if (typeIs(val, 'boolean')) {
        return {
            booleanValue: val as boolean,
        };
    }

    if (typeIs(val, 'number')) {
        if (val < (2 ^ 53 - 1)) {
            return {
                integerValue: val as number,
            };
        } else {
            return {
                doubleValue: val as number,
            };
        }
    }

    if (typeIs(val, 'nil')) {
        return {
            nullValue: 'NULL_VALUE',
        };
    }

    error('Unable to encode')
}

/**
 * Decodes a single Firestore 'Value' Protobuf.
 *
 * @private
 * @internal
 * @param proto A Firestore 'Value' Protobuf.
 * @returns The converted JS type.
 */
export function decodeValue(proto: IValue): unknown {
    const valueType = detectValueType(proto);

    switch (valueType) {
        case 'stringValue': {
            return proto.stringValue;
        }
        case 'booleanValue': {
            return proto.boolValue;
        }
        case 'integerValue': {
            return proto.integerValue;
        }
        case 'doubleValue': {
            return proto.doubleValue;
        }
        case 'nullValue': {
            return undefined;
        }
        default: {
            error('Unable to decode ')
        }
    }
}


export interface IValue {

    /** Value nullValue */
    nullValue?: (undefined | 'NULL_VALUE');

    /** Value numberValue */
    numberValue?: (number | undefined);

    /** Value stringValue */
    stringValue?: (string | undefined);

    /** Value boolValue */
    boolValue?: (boolean | undefined);
    booleanValue?: (boolean | undefined);

    /** Value structValue */
    structValue?: (undefined);

    /** Value listValue */
    listValue?: (undefined);

    integerValue?: (number | undefined)

    doubleValue?: (number | undefined)

    valueType?: (string)
}

export function detectValueType(proto: IValue): string {
    if (proto.valueType) {
        return proto.valueType;
    }

    const detectedValues: string[] = [];

    if (proto.stringValue !== undefined) {
        detectedValues.push('stringValue');
    }
    if (proto.booleanValue !== undefined) {
        detectedValues.push('booleanValue');
    }
    if (proto.integerValue !== undefined) {
        detectedValues.push('integerValue');
    }
    if (proto.doubleValue !== undefined) {
        detectedValues.push('doubleValue');
    }
    if (proto.nullValue !== undefined) {
        detectedValues.push('nullValue');
    }
    return detectedValues[0];
}