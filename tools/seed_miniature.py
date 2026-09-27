"""Reproducible fictional fixtures. No observed participant data."""
import json
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

ROOT = Path(__file__).resolve().parents[1]
uid = lambda name: str(uuid5(NAMESPACE_URL, 'oneiric:synthetic:'+name))
events = []
def event(name, kind, data, day=1, hour=8, author='curator', references=None):
    value = {'header':{'schema_version':'0.1.0','event_id':uid(name),
        'author_id':uid(author),'created_at':f'2026-09-{day:02d}T{hour:02d}:00:00Z',
        'visibility':'public','references':references or []}, 'payload':{'kind':kind,'data':data}}
    events.append(value)
    return value

people=['curator','moth','reed','tide','orbit','fern']
for name in people:
    event('presence-'+name,'presence',{'participant_id':uid(name),'handle':name,
        'description':'Fictional presence in the synthetic miniature world.'},hour=0,author=name)

places=[
 ('harbor','The dry harbor','emergent','A provisional grouping around an indoor harbor and descending stairs. The records disagree about whether water is present.',2,[200,180]),
 ('station','The rain station','emergent','A provisional grouping around a station where the weather seems to enter the building. Neither a shared location nor independence is established.',2,[555,180]),
 ('shore','Pacific shore','real','A broad real-world referent, not a verified geographic match. These fictional reports do not identify a specific beach.',1,[175,440]),
 ('library','The infinite library','fictional','A shared fictional setting invented for this demonstration: a library with rooms that repeat indefinitely.',1,[445,445]),
 ('orchard','The ceiling orchard','imagined','An environment invented by the fictional presence fern: trees grow down from the ceiling.',1,[685,440]),
]
layout={'synthetic':True,'places':{},'dreams':{}}
for key,name,cls,desc,day,xy in places:
    event('place-'+key,'place',{'place_id':uid(key),'name':name,'class':cls,'description':desc},day,hour=10)
    layout['places'][uid(key)]={'x':xy[0],'y':xy[1],'short':name}

reports=[
 ('Blue stairs','moth',1,'I walked down a blue stairway into a harbor inside a building. The basin was dry. Each boat rested on its own small wooden stand.','harbor','architecture','Blue stairs lead into an indoor harbor.','supports',[95,90]),
 ('Boats without water','reed',2,'There were boats in a tiled hall, but no water. I could hear a bell from somewhere beneath the floor. I never found the stairs.','harbor','objects','Boats on a dry floor; stairs not reported.','supports',[325,95]),
 ('The flooded landing','tide',3,'At the foot of the blue stairs, the water reached my chest. A rowboat knocked against the handrail. There was daylight but no visible window.','harbor','topology','A flooded basin conflicts with the dry-basin description.','contradicts',[85,240]),
 ('Windows over the basin','orbit',4,'The empty harbor had tall open windows. Wind pushed paper tickets across its floor. There were no boats, just their outlines in dust.','harbor','architecture','Open windows and absent boats complicate the proposed grouping.','uncertain',[325,260]),
 ('Rain between platforms','fern',1,'Rain fell between two train platforms. The roof was unbroken. I held a ticket with the destination rubbed away.','station','weather','Rain falls beneath an intact station roof.','supports',[445,80]),
 ('The silent train','moth',2,'A train arrived without a sound. The station floor was wet, though I did not see rain. I was waiting for someone whose face I had forgotten.','station','sound','Silence and a wet floor offer only a loose resemblance.','uncertain',[675,90]),
 ('An entirely dry station','reed',3,'The train station was hot and completely dry. Someone told me to keep an umbrella open anyway. Dust collected on the tracks.','station','weather','Heat and dry tracks conflict with the rain description.','contradicts',[435,270]),
 ('A ticket made of leaves','fern',4,'I handed the conductor a leaf. Rain was falling inside the carriage. At the window I could see trees growing upside down.','station','weather','Indoor rain resembles the station reports; it may be a broad motif.','supports',[680,260]),
 ('A familiar shoreline','tide',1,'I stood at the Pacific shoreline. The wet sand was black and I could hear traffic behind me. Everything felt ordinary until the waves stopped.','shore','biome','The report explicitly names the Pacific shoreline.','supports',[65,355]),
 ('Stones at low tide','orbit',2,'I was on a Pacific beach looking for a stone with a hole in it. Each time I bent down, the sea seemed farther away.','shore','objects','A Pacific beach is named, but no exact site is identified.','supports',[280,360]),
 ('The inland sea','moth',4,'I could see a beach through a kitchen doorway. There was no horizon; a wall stood just beyond the breaking waves. I did not recognize the coast.','shore','topology','Beach imagery alone does not identify the Pacific.','uncertain',[80,535]),
 ('The repeating room','reed',1,'I dreamed of the infinite library from our invented story. Every door led back to the same reading room. The books had warm covers.','library','architecture','The report explicitly recalls the fictional library.','supports',[365,355]),
 ('Books filled with weather','fern',2,'In the infinite library, a book opened into a little patch of rain. I closed it quickly because I was worried about the other books.','library','objects','Named fictional setting; rain is also a common link to the station.','supports',[550,355]),
 ('The last room','tide',4,'The library had an end. Behind its last shelf was a small garden and a locked gate. I was relieved that the corridors did not continue.','library','topology','A finite ending conflicts with the repeating-room description.','contradicts',[370,550]),
 ('Roots in plaster','fern',1,'I imagined an orchard growing from a ceiling before sleep. In the dream, roots broke through the plaster and apples hung beside the lamps.','orchard','topology','The participant describes deliberate pre-sleep imagination.','supports',[630,345]),
 ('The upright orchard','orbit',3,'The orchard was entirely ordinary. Trees grew out of the soil. One apple hovered above a branch, but nothing was upside down.','orchard','topology','Upright trees contradict the ceiling-orchard topology.','contradicts',[780,350]),
 ('An apple above the bed','fern',4,'I woke within the dream and saw an apple above my bed. It was attached to the ceiling by a thin root. I remembered the orchard I had imagined.','orchard','objects','Explicit recollection of the participant’s imagined orchard.','supports',[760,535]),
 ('A telephone under snow','reed',2,'A telephone rang beneath the snow. I dug with my hands but could never reach it. I woke before hearing a voice.',None,None,None,None,[240,635]),
 ('Only a color','orbit',3,'A flat red color. No room, no person, no story that I can remember.',None,None,None,None,[460,635]),
 ('No scene recalled','tide',4,'I remember waking with a feeling of urgency, but no scene or image remains.',None,None,None,None,[680,635]),
]
for i,(title,author,day,raw,place,dimension,value,stance,xy) in enumerate(reports,1):
    key=f'dream-{i:02}'
    dream=event(key,'dream',{'text':raw,'language':'en'},day,author=author)
    layout['dreams'][uid(key)]={'title':title,'code':f'D{i:02}','x':xy[0],'y':xy[1]}
    if place:
        place_day=next(p[4] for p in places if p[0]==place)
        event('observation-'+key,'place_observation',{'place_id':uid(place),
            'source_event_id':uid(key),'dimension':dimension,'value':value,
            'stance':stance,'exposure':'unknown'},max(day,place_day),hour=12,
            references=[{'event_id':uid(key),'relation':'derived_from'},{'event_id':uid('place-'+place),'relation':'supports' if stance=='supports' else 'contradicts' if stance=='contradicts' else 'derived_from'}])

event('annotation-harbor','annotation',{'subject_event_id':uid('dream-01'),
    'layer':'interpretation','text':'After reading the flooded-landing report, I began to wonder whether my dry basin could have held water. That thought was not in my original report.','exposure':'unknown'},5,author='moth',references=[{'event_id':uid('dream-01'),'relation':'annotates'}])
event('annotation-station','annotation',{'subject_event_id':uid('dream-06'),
    'layer':'interpretation','text':'I had read the rain-station description before this dream. Its wet floor should not be treated as an independent correspondence.','exposure':'unknown'},5,author='moth',references=[{'event_id':uid('dream-06'),'relation':'annotates'}])
event('annotation-leaf','annotation',{'subject_event_id':uid('dream-08'),
    'layer':'interpretation','text':'The upside-down trees also remind me of my ceiling orchard. The association is mine and was added after the report.','exposure':'unknown'},5,author='fern',references=[{'event_id':uid('dream-08'),'relation':'annotates'}])
event('observation-crosslink','place_observation',{'place_id':uid('orchard'),
    'source_event_id':uid('dream-08'),'dimension':'topology','value':'Upside-down trees suggest a second, later association with the ceiling orchard.','stance':'uncertain','exposure':'unknown'},5,hour=12,references=[{'event_id':uid('dream-08'),'relation':'derived_from'}])

events.sort(key=lambda e:(e['header']['created_at'],e['header']['event_id']))
bundle={'format':'oneiric-network-bundle','schema_version':'0.1.0','exported_at':'2026-09-05T23:59:59Z','scope':'public','events':events,'omitted_event_ids':[]}
for path,value in [('examples/miniature-world.json',bundle),('apps/web/layout.json',layout)]:
    target=ROOT/path
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(events)} fictional events, {len(reports)} reports, {len(places)} places.')
