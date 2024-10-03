import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1727949462989 implements MigrationInterface {
    name = ' $npmConfigName1727949462989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_action_action_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "user_action" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "action" "public"."user_action_action_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "PK_d035e078f4d722c689a98556169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_action" ADD CONSTRAINT "FK_c025478b45e60017ed10c77f99c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_action" DROP CONSTRAINT "FK_c025478b45e60017ed10c77f99c"`);
        await queryRunner.query(`DROP TABLE "user_action"`);
        await queryRunner.query(`DROP TYPE "public"."user_action_action_enum"`);
    }

}
