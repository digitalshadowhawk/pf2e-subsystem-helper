export class SubsystemData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const baseState = () => ({
            discovered: new fields.BooleanField({ initial: false }),
            points: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })
        });
        const subsystem = (state) => new fields.SchemaField({
            journal: new fields.DocumentUUIDField({ type: "JournalEntry", nullable: true, initial: null }),
            topics: new fields.TypedObjectField(new fields.SchemaField(state))
        });
        return {
            research: subsystem({
                ...baseState(),
                categories: new fields.TypedObjectField(
                    new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })
                )
            }),
            influence: subsystem({
                ...baseState(),
                max: new fields.NumberField({ nullable: true, integer: true, min: 0, initial: null }),
                active: new fields.ArrayField(new fields.StringField({ blank: false }), { initial: [] })
            }),
            reputation: subsystem({
                discovered: new fields.BooleanField({ initial: false }),
                points: new fields.NumberField({ required: true, nullable: false, integer: true, min: -50, max: 50, initial: 0 }),
                completed: new fields.ArrayField(new fields.StringField({ blank: false }), { initial: [] })
            }),
            chases: subsystem({
                discovered: new fields.BooleanField({ initial: false }),
                obstacle: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                points: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                opponent: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
                round: new fields.NumberField({ required: true, nullable: false, integer: true, min: 1, initial: 1 }),
                type: new fields.StringField({ required: true, choices: ["chaseDown", "runAway", "beatTheClock", "competitive"], initial: "chaseDown" }),
                pace: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
                rounds: new fields.NumberField({ nullable: true, integer: true, min: 1, initial: null }),
                revealedThrough: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                partySize: new fields.NumberField({ nullable: true, integer: true, min: 1, initial: null })
            }),
            infiltration: subsystem({
                discovered: new fields.BooleanField({ initial: false }),
                ap: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                edge: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                round: new fields.NumberField({ required: true, nullable: false, integer: true, min: 1, initial: 1 }),
                pcs: new fields.TypedObjectField(new fields.SchemaField({
                    objective: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                    ip: new fields.TypedObjectField(new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })),
                    cleared: new fields.ArrayField(new fields.StringField({ blank: false }))
                })),
                group: new fields.TypedObjectField(new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })),
                groupCleared: new fields.ArrayField(new fields.StringField({ blank: false })),
                complications: new fields.TypedObjectField(new fields.SchemaField({
                    active: new fields.BooleanField({ initial: false }),
                    resolved: new fields.BooleanField({ initial: false }),
                    points: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })
                })),
                opportunities: new fields.ArrayField(new fields.StringField({ blank: false })),
                reached: new fields.ArrayField(new fields.NumberField({ integer: true })),
                alerts: new fields.ArrayField(new fields.NumberField({ integer: true }))
            }),
            victory: subsystem({
                discovered: new fields.BooleanField({ initial: false }),
                points: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })
            }),
            hacking: subsystem({
                discovered: new fields.BooleanField({ initial: false }),
                round: new fields.NumberField({ required: true, nullable: false, integer: true, min: 1, initial: 1 }),
                points: new fields.TypedObjectField(new fields.SchemaField({
                    successes: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
                    failures: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 })
                })),
                exploited: new fields.ArrayField(new fields.StringField({ blank: false })),
                countermeasures: new fields.TypedObjectField(new fields.SchemaField({
                    noticed: new fields.BooleanField({ initial: false }),
                    disabled: new fields.BooleanField({ initial: false }),
                    triggered: new fields.BooleanField({ initial: false })
                })),
                alerts: new fields.ArrayField(new fields.StringField({ blank: false }))
            })
        };
    }
}