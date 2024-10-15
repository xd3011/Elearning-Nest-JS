import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1728966370300 implements MigrationInterface {
    name = ' $npmConfigName1728966370300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" text NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phoneNumber" character varying, "age" integer, "gender" character varying, "role" character varying NOT NULL, "image" character varying, "state" "public"."user_state_enum" NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" integer, "updatedBy" integer, "deletedBy" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_action" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "action" "public"."user_action_action_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "PK_d035e078f4d722c689a98556169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token" ("id" SERIAL NOT NULL, "paragraphs" text array NOT NULL, "otp" character varying NOT NULL, "expiredOtp" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_82319f64187836b307e6d6ba08d" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_a19025a009be58684a63961aaf3" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_2fa8b29c5038710d4111e4b7981" FOREIGN KEY ("deletedBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_action" ADD CONSTRAINT "FK_c025478b45e60017ed10c77f99c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_action" DROP CONSTRAINT "FK_c025478b45e60017ed10c77f99c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_2fa8b29c5038710d4111e4b7981"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_a19025a009be58684a63961aaf3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_82319f64187836b307e6d6ba08d"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "user_action"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
