import clientPromise from "@/app/_lib/user-management-server/mongodb"
import { GroupDoc } from "@/app/api/documents"
import { Metadata, ResolvingMetadata } from "next"
import { Inter } from "next/font/google"

type Props = {
    params: { group: string; phoneNr: string; token: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {

    const group = decodeURIComponent(params.group)
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const col = db.collection<GroupDoc>('groups');
    const groupDoc = await col.findOne({
        _id: group
    }, {
        projection: {
            docTitle: 1,
            line1: 1
        }
    })
    return {
        title: groupDoc?.docTitle ?? groupDoc?.line1.text ?? 'pr-groups'
    }
}
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  
  
    return (
      <html lang="de">
        <body className={inter.className}>
          <div className='d1'>
            <div className='d5'>
              <div className='d6'>
              </div>
              <div id='d4' className='d4'>
                d4
              </div>
            </div>
            <div className='d2'>
            </div>
            <div className='d3'>
              {children}
            </div>
          </div>
        </body>
      </html>
    );
  }
  
