import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { AddressBook } from '../models/AddressBook';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// import { PDFDocument } from 'pdf-lib';
import PDFDocument from 'pdfkit';

// Photo uploads
/* const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  });
  
const upload = multer({ storage }); */


@Resolver(AddressBook)
export class AddressBookResolver {
  private addressBooks: AddressBook[] = [];

  @Query(() => [AddressBook])
  getAddressBooks(): AddressBook[] {
    return this.addressBooks;
  }

  @Query(() => AddressBook, { nullable: true })
  getAddressBook(@Arg('id') id: string): AddressBook | undefined {
    return this.addressBooks.find(entry => entry.id === id);
  }

  @Mutation(() => AddressBook)
  addAddressBook(
    @Arg('name') name: string,
    @Arg('address') address: string,
    @Arg('email') email: string,
    @Arg('phone') phone: string,
    @Arg('photo', () => String) photo?: string
  ): AddressBook {
    const entry = { id: uuidv4(), name, address, email, phone, photo };
    this.addressBooks.push(entry);
    return entry;
  }

  @Mutation(() => AddressBook, { nullable: true })
  updateAddressBook(
    @Arg('id') id: string,
    @Arg('name', { nullable: true }) name?: string,
    @Arg('address', { nullable: true }) address?: string,
    @Arg('email', { nullable: true }) email?: string,
    @Arg('phone', { nullable: true }) phone?: string,
    @Arg('photo', () => String) photo?: string
  ): AddressBook | undefined {
    const entry = this.addressBooks.find(e => e.id === id);
    if (!entry) return undefined;

    if (name) entry.name = name;
    if (address) entry.address = address;
    if (email) entry.email = email;
    if (phone) entry.phone = phone;
    if (photo) entry.photo = photo;

    return entry;
  }

  @Mutation(() => Boolean)
  deleteAddressBook(@Arg('id') id: string): boolean {
    const index = this.addressBooks.findIndex(entry => entry.id === id);
    if (index === -1) return false;
    this.addressBooks.splice(index, 1);
    return true;
  }

    @Mutation(() => String)
    async exportAddressBookAsPDF(): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Add entries to PDF
    this.addressBooks.forEach((entry, index) => {
        page.drawText(`${index + 1}. ${entry.name} - ${entry.email}`, {
        x: 50,
        y: height - 50 - index * 20,
        });
    });

    const pdfBytes = await pdfDoc.save();
    const pdfFileName = `address_book_${Date.now()}.pdf`;
    fs.writeFileSync(`exports/${pdfFileName}`, pdfBytes);
    
    return pdfFileName; 
    }

    @Mutation(() => String)
    async exportToPDF(): Promise<string> {
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, '../../uploads', `address_book_${uuidv4()}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add title
        doc.fontSize(25).text('Address Book', { align: 'center' });

        // Add a line break
        doc.moveDown();

        this.addressBooks.forEach(entry => {
        doc
            .fontSize(12)
            .text(`Name: ${entry.name}`)
            .text(`Address: ${entry.address}`)
            .text(`Email: ${entry.email}`)
            .text(`Phone: ${entry.phone}`)
            .text(`Photo: ${entry.photo || 'No photo'}`)
            .moveDown(); 
        });

        doc.end();

        return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            resolve(filePath); 
        });

        writeStream.on('error', (error) => {
            reject(error);
        });
        });
    }

    /* @Mutation(() => AddressBook)
    async uploadPhoto(
        @Arg('file', () => String) filePath: string // Get the photo path as a string
    ): Promise<AddressBook> {
        const photoPath = path.join(__dirname, '../../uploads', filePath);
        const newEntry: AddressBook = {
        id: uuidv4(),
        name: '', 
        address: '', 
        email: '', 
        phone: '', 
        photo: photoPath 
        };
        this.addressBooks.push(newEntry);
        return newEntry;
    } */
    
}
