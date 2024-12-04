type Condition = {
    column?: string;
    operator?: string;
    value?: any;
    AND?: Condition[];
    OR?: Condition[];
};

export default class WhereClauseBuilder {
    conditions: Condition[];

    constructor() {
        this.conditions = [];
    }

    // Add AND condition
    // and(): WhereClauseBuilder {
    //     const builder = new WhereClauseBuilder();
    //     this.conditions.push({ AND: builder.conditions });
    //     return builder;
    // }

    // Add OR condition
    // or(): WhereClauseBuilder {
    //     const builder = new WhereClauseBuilder();
    //     this.conditions.push({ OR: builder.conditions });
    //     return builder;
    // }

    // Equality check
    eq(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "eq", value });
        return this;
    }

    // Not equal check
    neq(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "neq", value });
        return this;
    }

    // Greater than
    gt(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "gt", value });
        return this;
    }

    // Less than
    lt(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "lt", value });
        return this;
    }

    // Greater than or equal to
    gte(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "gte", value });
        return this;
    }

    // Less than or equal to
    lte(column: string, value: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "lte", value });
        return this;
    }

    // LIKE (pattern match)
    like(column: string, pattern: string): WhereClauseBuilder {
        this.conditions.push({ column, operator: "like", value: pattern });
        return this;
    }

    // IN (for multiple values)
    in(column: string, values: any[]): WhereClauseBuilder {
        this.conditions.push({ column, operator: "in", value: values });
        return this;
    }

    // IS NULL
    isNull(column: string): WhereClauseBuilder {
        this.conditions.push({ column, operator: "is", value: null });
        return this;
    }

    // IS NOT NULL
    isNotNull(column: string): WhereClauseBuilder {
        this.conditions.push({ column, operator: "is", value: { not: null } });
        return this;
    }

    // BETWEEN (for range checking)
    between(column: string, start: any, end: any): WhereClauseBuilder {
        this.conditions.push({ column, operator: "between", value: [start, end] });
        return this;
    }

    // Build and return the final condition object
    build(): Condition {
        // if (this.conditions.length === 1) {
        //     return this.conditions; // Direct return if only one condition
        // }
        return { AND: this.conditions }; // If multiple conditions, combine using AND
    }
}
