import { config, SNS } from 'aws-sdk';
import { IAuditEvent } from '../models/audit-event';
import { PublishInput } from 'aws-sdk/clients/sns';

export class SnsService {
    static async publishMessageToSNS(message: IAuditEvent, topicArn: string | undefined): Promise<void> {
        console.log(`Topic ARN: ${topicArn}`);

        config.update({ region: process.env.AWS_REGION });
        
        let cleanMessage = this.removeEmpty(message);

        const params: PublishInput = {
            Message: JSON.stringify(cleanMessage),
            TopicArn: topicArn,
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: message.event_name,
                },
            },
        };

        const sns = new SNS({ apiVersion: '2010-03-31' });

        const publishTextPromise = sns.publish(params).promise();

        await publishTextPromise
            .then((data) => {
                console.log('MessageID is ' + data.MessageId);
            })
            .catch((err) => {
                console.error(err, err.stack);
            });

        return;
    }

    static removeEmpty(obj : any) : unknown {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v != null)
            .filter(([_, v]) => v != "")
            .map(([k, v]) => [k, v === Object(v) ? this.removeEmpty(v) : v])
        );
    }
}
