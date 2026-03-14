const entityExample = `
@Entity('entity')
export class Entity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

}`;
export default entityExample;
