import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class AddressBook {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  photo?: string;

  constructor(id: string, name: string, address: string, email: string, phone: string, photo: string) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.photo = photo;
  }
  
}
