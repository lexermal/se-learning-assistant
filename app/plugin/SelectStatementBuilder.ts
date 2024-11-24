import { SupabaseClient } from '@supabase/supabase-js';

interface Condition {
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'like' | 'in' | 'is' | 'between';
    value: any;
}

interface WhereClause {
    AND?: Condition[];
}

export default function buildSupabaseQuery(supabaseClient: SupabaseClient, table: string, select = "*", whereClause?: WhereClause) {
    let qb = supabaseClient.from(table).select(select);

    const applyConditions = ({ column, operator, value }: Condition) => {
        switch (operator) {
            case 'eq':
                console.log('eq', column, value);
                qb = qb.eq(column, value);
                break;
            case 'neq':
                qb = qb.neq(column, value);
                break;
            case 'gt':
                qb = qb.gt(column, value);
                break;
            case 'lt':
                qb = qb.lt(column, value);
                break;
            case 'like':
                qb = qb.like(column, value);
                break;
            case 'in':
                qb = qb.in(column, value);
                break;
            case 'is':
                qb = qb.is(column, value);
                break;
            case 'between':
                qb = qb.gte(column, value[0]).lte(column, value[1]);
                break;
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    };

    if (whereClause?.AND) {
        whereClause.AND.forEach(applyConditions);
    }

    return qb;
}

